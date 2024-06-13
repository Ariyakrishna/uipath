pipeline {
    agent any
	
	        environment {
	        MAJOR = '1'
	        MINOR = '0'
	        //Orchestrator Services
	        UIPATH_ORCH_URL = "https://cloud.uipath.com/"
	        UIPATH_ORCH_LOGICAL_NAME = "Aarya. S S"
	        UIPATH_ORCH_TENANT_NAME = "DefaultTenant"
	        UIPATH_ORCH_FOLDER_NAME = "TestingDevops"
	    }


    stages {
        // Printing Basic Information
        stage('Preparing') {
            steps {
                echo "Jenkins Home ${env.JENKINS_HOME}"
                echo "Jenkins URL ${env.JENKINS_URL}"
                echo "Jenkins JOB Number ${env.BUILD_NUMBER}"
                echo "Jenkins JOB Name ${env.JOB_NAME}"
                echo "GitHub Branch Name ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        // Build Stage
        stage('Build') {
            steps {
                echo "Building..with ${WORKSPACE}"
                UiPathPack (
                    outputPath: "Output\\${env.BUILD_NUMBER}",
                    projectJsonPath: "project.json",
                    version: [$class: 'ManualVersionEntry', version: "1.0.${env.BUILD_NUMBER}"],
                    useOrchestrator: false,
                    traceLevel: 'None'
                )
            }
        }

        // Test Stage
        stage('Test') {
            steps {
                echo 'Testing..the workflow...'
            }
        }

        // Deploy to UAT Stage
        stage('Deploy to UAT') {
            steps {
                echo "Deploying ${BRANCH_NAME} to UAT"
                UiPathDeploy (
                    packagePath: "Output\\${env.BUILD_NUMBER}",
                    orchestratorAddress: "https://cloud.uipath.com/",
                    orchestratorTenant: "DefaultTenant",
                    folderName: "TestingDevops",
                    environments: 'environments',
                    //credentials: [$class: 'UserPassAuthenticationEntry', credentialsId: 'APIUserKey']
                    credentials: Token(accountName: ${UIPATH_ORCH_LOGICAL_NAME}, credentialsId: 'UipathAPIaarya'),
                    traceLevel: 'None',
                    entryPointPaths: 'Main.xaml'
                )
            }
        }

        // Deploy to Production Stage
        stage('Deploy to Production') {
            steps {
                echo 'Deploy to Production'
            }
        }
    }

    // Options
    options {
        // Timeout for pipeline
        timeout(time: 80, unit: 'MINUTES')
        skipDefaultCheckout()
    }

    post {
        success {
            echo 'Deployment has been completed!'
        }
        failure {
            echo "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.JOB_DISPLAY_URL})"
        }
        always {
            /* Clean workspace if success */
            cleanWs()
        }
    }
}
