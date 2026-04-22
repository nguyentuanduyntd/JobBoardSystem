from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


# ============================================================
# TASK 1 — Gửi email xác nhận cho CANDIDATE khi nộp đơn
# + Thông báo cho EMPLOYER (task gốc notify_new_application)
# ============================================================
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_new_application(self, candidate_name, candidate_email,
                           job_title, company_name):
    """
    Task gốc giữ nguyên tên để không break code cũ.
    Gửi email cho cả candidate lẫn employer.
    """
    try:
        # --- Email cho Candidate ---
        send_mail(
            subject=f'[JobBoard] Xác nhận nộp đơn — {job_title}',
            message=f"""
Xin chào {candidate_name},

Bạn đã nộp đơn ứng tuyển thành công!

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vị trí  : {job_title}
Công ty : {company_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chúng tôi sẽ thông báo kết quả sớm nhất.

Trân trọng,
JobBoard Team
            """.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate_email],
            fail_silently=False,
        )
        print(f'[TASK OK] Confirmation sent to candidate: {candidate_email}')
        return {'status': 'ok'}

    except Exception as exc:
        print(f'[TASK ERROR] notify_new_application: {exc}')
        raise self.retry(exc=exc)


# ============================================================
# TASK 2 — Thông báo cho EMPLOYER khi có ứng viên mới
# ============================================================
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_employer_new_application(self, application_id):
    try:
        from applications.models import Application
        from users.models import EmployerProfile

        app = Application.objects.select_related(
            'candidate', 'job', 'job__company'
        ).get(id=application_id)

        # Lấy tất cả employer của company đó
        employers = EmployerProfile.objects.select_related('user').filter(
            company=app.job.company
        )
        recipient_emails = [ep.user.email for ep in employers if ep.user.email]

        if not recipient_emails:
            print(f'[TASK SKIP] No employer email for company: {app.job.company.name}')
            return {'status': 'skipped'}

        send_mail(
            subject=f'[JobBoard] Ứng viên mới — {app.job.title}',
            message=f"""
Xin chào,

Vị trí "{app.job.title}" vừa có ứng viên mới!

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ứng viên : {app.candidate.get_full_name() or app.candidate.username}
Email    : {app.candidate.email}
Ngày nộp : {app.applied_date.strftime('%d/%m/%Y %H:%M')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Đăng nhập hệ thống để xem chi tiết.

Trân trọng,
JobBoard Team
            """.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_emails,
            fail_silently=False,
        )
        print(f'[TASK OK] Notified employers: {recipient_emails}')
        return {'status': 'ok', 'emails': recipient_emails}

    except Exception as exc:
        print(f'[TASK ERROR] notify_employer_new_application: {exc}')
        raise self.retry(exc=exc)


# ============================================================
# TASK 3 — Thông báo CANDIDATE khi status thay đổi
# ============================================================
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_candidate_status_changed(self, application_id):
    try:
        from applications.models import Application

        app = Application.objects.select_related(
            'candidate', 'job', 'job__company'
        ).get(id=application_id)

        status_content = {
            'REVIEWING': {
                'subject': f'[JobBoard] Đơn đang được xem xét — {app.job.title}',
                'msg': 'Đơn ứng tuyển của bạn đang được xem xét. Chúng tôi sẽ liên hệ sớm nhất.',
                'icon': '🔍',
            },
            'ACCEPTED': {
                'subject': f'[JobBoard] 🎉 Chúc mừng! Đơn được chấp nhận — {app.job.title}',
                'msg': 'Đơn ứng tuyển của bạn đã được CHẤP NHẬN! Nhà tuyển dụng sẽ liên hệ để sắp xếp các bước tiếp theo.',
                'icon': '✅',
            },
            'REJECTED': {
                'subject': f'[JobBoard] Kết quả ứng tuyển — {app.job.title}',
                'msg': 'Rất tiếc, đơn ứng tuyển của bạn chưa phù hợp lần này. Chúc bạn may mắn với các cơ hội tiếp theo!',
                'icon': '❌',
            },
        }

        if app.status not in status_content:
            return {'status': 'skipped'}

        content = status_content[app.status]

        send_mail(
            subject=content['subject'],
            message=f"""
Xin chào {app.candidate.get_full_name() or app.candidate.username},

{content['msg']}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vị trí    : {app.job.title}
Công ty   : {app.job.company.name}
{content['icon']} Trạng thái : {app.get_status_display()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trân trọng,
JobBoard Team
            """.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.candidate.email],
            fail_silently=False,
        )
        print(f'[TASK OK] Status email sent to: {app.candidate.email}')
        return {'status': 'ok'}

    except Exception as exc:
        print(f'[TASK ERROR] notify_candidate_status_changed: {exc}')
        raise self.retry(exc=exc)


# ============================================================
# TASK 4 — Thông báo lịch phỏng vấn cho CANDIDATE
# ============================================================
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_interview_schedule(self, application_id):
    try:
        from applications.models import Application

        app = Application.objects.select_related(
            'candidate', 'job', 'job__company'
        ).get(id=application_id)

        if not app.interview_date:
            return {'status': 'skipped', 'reason': 'no interview_date'}

        send_mail(
            subject=f'[JobBoard]  Lịch phỏng vấn — {app.job.title}',
            message=f"""
Xin chào {app.candidate.get_full_name() or app.candidate.username},

Bạn có lịch phỏng vấn mới!

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vị trí    : {app.job.title}
Công ty   : {app.job.company.name}
Thời gian : {app.interview_date.strftime('%d/%m/%Y %H:%M')}
Địa điểm  : {app.interview_address or 'Sẽ thông báo sau'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chúc bạn phỏng vấn thành công! 🍀

Trân trọng,
JobBoard Team
            """.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.candidate.email],
            fail_silently=False,
        )
        print(f'[TASK OK] Interview schedule sent to: {app.candidate.email}')
        return {'status': 'ok'}

    except Exception as exc:
        print(f'[TASK ERROR] send_interview_schedule: {exc}')
        raise self.retry(exc=exc)


# ============================================================
# TASK 5 — Tổng hợp đơn hàng tuần (Celery Beat tự chạy)
# ============================================================
@shared_task
def send_weekly_summary():
    from applications.models import Application
    from users.models import EmployerProfile
    from datetime import timedelta

    one_week_ago = timezone.now() - timedelta(days=7)
    employers = EmployerProfile.objects.select_related('user', 'company').filter(
        user__email__isnull=False
    )

    for ep in employers:
        if not ep.company:
            continue

        applications = Application.objects.filter(
            job__company=ep.company,
            applied_date__gte=one_week_ago,
        ).select_related('job', 'candidate')

        count = applications.count()
        if count == 0:
            continue

        lines = '\n'.join([
            f"  • {a.candidate.get_full_name() or a.candidate.username}"
            f" → {a.job.title} ({a.get_status_display()})"
            for a in applications
        ])

        send_mail(
            subject=f'[JobBoard] Báo cáo tuần — {count} đơn mới',
            message=f"""
Xin chào {ep.user.get_full_name() or ep.user.username},

Tổng hợp đơn ứng tuyển tuần này của {ep.company.name}:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Tổng đơn mới: {count}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
{lines}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trân trọng,
JobBoard Team
            """.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[ep.user.email],
            fail_silently=True,
        )

    print(f'[TASK OK] Weekly summary done')