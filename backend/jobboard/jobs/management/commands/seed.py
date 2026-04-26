from django.core.management.base import BaseCommand
from companies.models import Company
from jobs.models import Job, JobCategory, Skill
from django.utils import timezone
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Seed data'

    def handle(self, *args, **kwargs):
        skills = []
        for content in ["Python", "Django", "JavaScript", "React", "NodeJS", "SQL", "PostgreSQL", "Docker", "AWS", "Git"]:
            s, _ = Skill.objects.get_or_create(content=content)
            skills.append(s)
        self.stdout.write(f"Skills: {len(skills)}")

        categories = []
        for name in ["Backend Developer", "Frontend Developer", "Fullstack Developer", "DevOps Engineer", "Data Engineer"]:
            c, _ = JobCategory.objects.get_or_create(name=name)
            categories.append(c)
        self.stdout.write(f"Categories: {len(categories)}")

        companies = []
        for data in [
            {"name": "FPT Software", "description": "Cong ty phan mem hang dau VN", "location": "Ha Noi"},
            {"name": "VNG Corporation", "description": "Tap doan cong nghe VNG", "location": "TP.HCM"},
            {"name": "Tiki", "description": "San thuong mai dien tu", "location": "TP.HCM"},
            {"name": "MoMo", "description": "Vi dien tu MoMo", "location": "TP.HCM"},
            {"name": "Grab Vietnam", "description": "Ung dung goi xe Grab", "location": "Ha Noi"},
        ]:
            c, _ = Company.objects.get_or_create(name=data["name"], defaults=data)
            companies.append(c)
        self.stdout.write(f"Companies: {len(companies)}")

        jobs_list = [
            {"title": "Senior Python Developer", "description": "Phat trien backend Python/Django", "location": "Ha Noi", "salary_min": 25000000, "salary_max": 45000000, "job_type": "FT", "slots": 2},
            {"title": "React Frontend Developer", "description": "Xay dung UI voi ReactJS", "location": "TP.HCM", "salary_min": 20000000, "salary_max": 40000000, "job_type": "FT", "slots": 3},
            {"title": "Fullstack Developer", "description": "Phat trien full stack", "location": "TP.HCM", "salary_min": 30000000, "salary_max": 55000000, "job_type": "FT", "slots": 1},
            {"title": "DevOps Engineer", "description": "CI/CD Docker Kubernetes", "location": "Ha Noi", "salary_min": 35000000, "salary_max": 60000000, "job_type": "RE", "slots": 2},
            {"title": "Data Engineer", "description": "Xay dung data pipeline", "location": "TP.HCM", "salary_min": 28000000, "salary_max": 50000000, "job_type": "FT", "slots": 1},
            {"title": "Java Spring Boot Developer", "description": "Microservice voi Java", "location": "Da Nang", "salary_min": 22000000, "salary_max": 42000000, "job_type": "FT", "slots": 2},
            {"title": "Mobile Developer Flutter", "description": "App di dong Flutter/Dart", "location": "Ha Noi", "salary_min": 20000000, "salary_max": 38000000, "job_type": "FT", "slots": 2},
            {"title": "QA Automation Engineer", "description": "Test tu dong Selenium/Pytest", "location": "TP.HCM", "salary_min": 15000000, "salary_max": 28000000, "job_type": "FT", "slots": 3},
            {"title": "Backend NodeJS Developer", "description": "REST API voi NodeJS", "location": "Ha Noi", "salary_min": 18000000, "salary_max": 35000000, "job_type": "RE", "slots": 2},
            {"title": "Part-time React Developer", "description": "Ho tro team frontend", "location": "TP.HCM", "salary_min": 8000000, "salary_max": 15000000, "job_type": "PT", "slots": 2},
        ]

        count = 0
        for i, data in enumerate(jobs_list):
            job, created = Job.objects.get_or_create(
                title=data["title"],
                defaults={
                    **data,
                    "company": companies[i % len(companies)],
                    "category": categories[i % len(categories)],
                    "deadline": timezone.now() + timedelta(days=random.randint(15, 60)),
                }
            )
            if created:
                job.skills.set(random.sample(skills, k=3))
                count += 1

        self.stdout.write(f"Jobs created: {count}")
        self.stdout.write("HOAN TAT!")