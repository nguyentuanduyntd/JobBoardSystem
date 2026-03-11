from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, EmployerProfile, CandidateProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == User.Role.CANDIDATE:
            CandidateProfile.objects.create(user=instance)
        elif instance.role == User.Role.EMPLOYER:
            EmployerProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if instance.role == User.Role.CANDIDATE and hasattr(instance, 'candidate_profile'):
        instance.candidate_profile.save()
    elif instance.role == User.Role.EMPLOYER and hasattr(instance, 'employer_profile'):
        instance.employer_profile.save()
