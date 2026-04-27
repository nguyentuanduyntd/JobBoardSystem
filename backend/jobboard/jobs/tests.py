from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job, JobCategory, Skill
from companies.models import Company  # import model Company

class JobCategoryModelTest(TestCase):

    def setUp(self):
        self.category = JobCategory.objects.create(name="IT")

    # Test __str__
    def test_str_returns_name(self):
        self.assertEqual(str(self.category), "IT")

    # Test active mặc định là True (kế thừa BaseModel)
    def test_active_default_true(self):
        self.assertTrue(self.category.active)

    # Test created_date tự động tạo
    def test_created_date_auto(self):
        self.assertIsNotNone(self.category.created_date)


class SkillModelTest(TestCase):

    def setUp(self):
        self.skill = Skill.objects.create(content="Python")

    def test_str_returns_content(self):
        self.assertEqual(str(self.skill), "Python")

    def test_active_default_true(self):
        self.assertTrue(self.skill.active)


class JobModelTest(TestCase):

    def setUp(self):
        # Tạo Company 
        self.company = Company.objects.create(
            name="Tech Corp",
            # thêm các field
        )

        self.category = JobCategory.objects.create(name="IT")

        self.skill_python = Skill.objects.create(content="Python")
        self.skill_django = Skill.objects.create(content="Django")

        self.job = Job.objects.create(
            title="Backend Developer",
            description="Develop backend services",
            location="Ho Chi Minh",
            salary_min=1000,
            salary_max=2000,
            job_type="FT",
            slots=3,
            company=self.company,
            category=self.category,
        )
        # Thêm skills (ManyToMany phải dùng .add())
        self.job.skills.add(self.skill_python, self.skill_django)

    # ✅ Test __str__
    def test_str_returns_title_and_company(self):
        self.assertEqual(str(self.job), "Backend Developer - Tech Corp")

    # ✅ Test salary (optional fields)
    def test_salary_can_be_null(self):
        job = Job.objects.create(
            title="No Salary Job",
            description="desc",
            location="HN",
            company=self.company,
        )
        self.assertIsNone(job.salary_min)
        self.assertIsNone(job.salary_max)

    def test_salary_min_max(self):
        self.assertEqual(self.job.salary_min, 1000)
        self.assertEqual(self.job.salary_max, 2000)
