pipeline {
    agent any

    options {
        timeout(time: 45, unit: 'MINUTES')
        timestamps()
    }

    environment {
        PYTHON_EXE = 'C:\\Users\\LENOVO\\AppData\\Local\\Programs\\Python\\Python313\\python.exe'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend - Install dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Backend - Python version') {
            steps {
                dir('backend') {
                    bat '"%PYTHON_EXE%" --version'
                }
            }
        }

        stage('Backend - Install requirements') {
            steps {
                dir('backend') {
                    bat '"%PYTHON_EXE%" -m pip install -r requirements.txt'
                }
            }
        }

        stage('Backend - Django check') {
            steps {
                dir('backend\\jobboard') {
                    bat '"%PYTHON_EXE%" manage.py check'
                }
            }
        }
    }

    post {
        success {
            echo 'Build frontend và kiểm tra backend thành công'
            archiveArtifacts artifacts: 'frontend/dist/**/*', fingerprint: true, allowEmptyArchive: false
        }
        failure {
            echo 'Pipeline thất bại'
        }
    }
}