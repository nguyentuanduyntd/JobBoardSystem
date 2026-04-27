from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import User, CandidateProfile, EmployerProfile
from companies.models import Company
import uuid
class UserModelTest(TestCase):

    def setUp(self):
        self.candidate = User.objects.create_user(
            username="candidate1",
            password="pass123",
            role=User.Role.CANDIDATE,
        )
        self.employer = User.objects.create_user(
            username="employer1",
            password="pass123",
            role=User.Role.EMPLOYER,
        )
        self.admin = User.objects.create_user(
            username="admin1",
            password="pass123",
            role=User.Role.ADMIN,
        )

    # ✅ Test __str__
    def test_str_returns_username(self):
        self.assertEqual(str(self.candidate), "candidate1")

    # ✅ Test role default là CANDIDATE
    def test_role_default_is_candidate(self):
        user = User.objects.create_user(username="username", password="pass123")
        self.assertEqual(user.role, User.Role.CANDIDATE)
    #
    def test_candidate_role_is_candidate(self):
        self.assertEqual(self.candidate.role, User.Role.CANDIDATE)
    # ✅ Test avatar có thể null
    def test_avatar_can_be_null(self):
        self.assertFalse(self.candidate.avatar)



class CandidateProfileModelTest(TestCase):

   def setUp(self):
    self.user = User.objects.create_user(
        username="candidate1",
        password="pass123",
        role=User.Role.CANDIDATE,
    )
    # Đổi create → get_or_create
    self.profile, _ = CandidateProfile.objects.get_or_create(
        user=self.user,
        defaults={"bio": "I am a Python developer"}
    )
    # ✅ Test __str__
    def test_str_returns_username(self):
        self.assertEqual(str(self.profile), "candidate1")

    # ✅ Test OneToOne với User
    def test_profile_linked_to_user(self):
        self.assertEqual(self.profile.user, self.user)






