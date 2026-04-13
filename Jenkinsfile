pipeline {
    agent any

    options {
        timeout(time: 45, unit: 'MINUTES')
        timestamps()
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
                    bat 'py --version'
                }
            }
        }

        stage('Backend - Install requirements') {
            steps {
                dir('backend') {
                    bat 'py -m pip install -r requirements.txt'
                }
            }
        }

        stage('Backend - Django check') {
            steps {
                dir('backend') {
                    bat 'py manage.py check'
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