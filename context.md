Project Vision
SWASTHYA is a behavioral distress intelligence and emotional wellbeing ecosystem designed to support emotionally exhausted, isolated, cognitively overloaded, and behaviorally deteriorating individuals through low-friction behavioral analysis, calming emotional support, healthcare-assisted accessibility, and AI-driven escalation systems. The platform is intentionally designed to avoid the shortcomings of traditional mental-health applications that rely heavily on emotional disclosure, journaling, therapy-style interaction, or long onboarding questionnaires. Instead of forcing users to openly describe emotional struggles, SWASTHYA focuses on identifying behavioral drift, burnout escalation, emotional heaviness, social withdrawal, sleep deterioration, cognitive exhaustion, and somatic distress patterns through passive and semi-passive behavioral signals.
The foundation of the system originated from CalmWave, an emotional decompression and calming support platform focused on music-based emotional regulation, ambient soundscapes, breathing exercises, and low-pressure emotional support tools. As the idea evolved, the team recognized that emotionally vulnerable individuals often disengage from platforms that demand high emotional participation. This led to the transformation of CalmWave into a broader behavioral intelligence ecosystem capable of supporting both technical and non-technical populations through AI-assisted behavioral analysis and healthcare accessibility infrastructure.
SWASTHYA is not being positioned as a therapy chatbot, emotional AI companion, productivity application, or psychiatric diagnosis system. The platform instead acts as a behavioral intelligence and support infrastructure that quietly detects behavioral deterioration patterns over time and creates meaningful support pathways through healthcare systems, emotional support tools, and accessibility-focused interventions.

Core Product Philosophy
The entire platform is built around the idea that emotionally distressed individuals should not need to emotionally exhaust themselves in order to receive support. The system prioritizes emotional safety, minimal cognitive load, low-friction interaction, gradual trust building, and passive behavioral intelligence rather than emotionally demanding engagement systems. The platform avoids manipulative engagement loops, emotionally invasive AI systems, fake therapeutic empathy, and excessive emotional interrogation. The goal is to create a calm, emotionally safe environment where distress can be identified behaviorally rather than requiring direct emotional disclosure.

## Current Implementation Status (Hackathon MVP)
As of the latest sprint, the backend infrastructure is fully operational and the foundation for the frontend is laid out. Specifically:

1. **Database Pivot:** Successfully migrated from Azure Cosmos DB to MongoDB Atlas due to Azure subscription constraints. Mongoose schemas are fully implemented for `User`, `CheckIn`, `HealthAggregate`, and `IVRSignal`.
2. **AI & Voice Architecture:** We built a fully working IVR (Interactive Voice Response) system using Twilio Webhooks. It routes voice calls to our Node.js backend (exposed via `ngrok`). The backend then uses the **Gemini 2.5 Flash REST API** (bypassing OpenAI quota limits) to generate empathetic conversational replies and concurrently perform sentiment analysis on the caller's speech.
3. **Backend API Readiness:** The Express.js server has been expanded with REST API endpoints (`POST /api/users`, `POST /api/checkins`, `GET /api/dashboard/:userId`) to support the upcoming React Native frontend integration.
4. **Data Logging:** Voice session data, including mock call durations, speech metrics, and Gemini-calculated sentiment scores, are successfully saving to MongoDB in real-time as `IVRSignal` documents.

Final Product Architecture
The ecosystem is divided into four connected layers:
CalmWave Emotional Support Layer
Behavioral Intelligence & AI Layer
Healthcare Accessibility Layer
Voice-Based Accessibility & Escalation Layer
These four systems together form the final SWASTHYA architecture.

1. CalmWave Emotional Support Layer
This is the primary user-facing wellness environment inside the application. The purpose of this layer is to emotionally stabilize and decompress users before expecting any behavioral participation. Emotionally exhausted users often abandon systems that immediately behave clinically or emotionally demanding, so CalmWave acts as the emotionally safe entry point into the ecosystem.
This layer includes:
calming soundscapes
mood-based music systems
grounding exercises
breathing exercises
low-stimulation calming UI
emotional decompression tools
relaxation support experiences
The platform intentionally feels more like a calming wellness space than a clinical healthcare application.

2. Behavioral Intelligence & AI Layer
This is the core technical intelligence system of the platform. Instead of diagnosing mental illnesses, the AI layer focuses on detecting behavioral deterioration patterns and distress escalation through behavioral drift analysis.
The system collects:
sleep quality
exhaustion levels
stress indicators
social energy
focus decline
activity reduction
cognitive fatigue
somatic discomfort
optional acoustic voice markers
These are collected through:
lightweight micro check-ins
passive health integrations
optional voice interactions
healthcare observations
The AI system then analyzes behavioral trends over time to detect:
burnout escalation
emotional deterioration
withdrawal patterns
behavioral instability
distress anomalies
The platform intentionally avoids claiming psychiatric diagnosis and instead positions itself as a behavioral deterioration detection and support system.

3. Healthcare Accessibility Layer
One of the most important realizations during product ideation was that purely digital systems exclude elderly users, rural populations, non-smartphone users, and emotionally withdrawn individuals. To solve this, the platform integrates healthcare-assisted accessibility systems into the ecosystem.
ASHA workers act as human support bridges who help:
onboard users
maintain wellness profiles
assist non-technical populations
follow up severe distress cases
receive escalation alerts
Doctors and GPs can access separate healthcare interfaces where they can:
view wellness history
monitor behavioral deterioration
update behavioral observations
record somatic symptoms
trigger support escalation
Users may also maintain wellness cards or digital profiles that preserve continuity across healthcare interactions.

4. Voice-Based Accessibility & Escalation Layer
The voice-call system exists to support:
keypad-phone users
rural populations
elderly individuals
isolated users
emotionally withdrawn individuals
Users can call a dedicated support number without requiring smartphone access. The voice system conversationally interacts with users, extracts distress-related behavioral signals, and identifies escalation patterns. If severe behavioral concerns are detected, ASHA workers or healthcare systems may receive escalation alerts for follow-up support.
The system intentionally focuses on behavioral distress detection rather than emotional surveillance or therapy simulation.

Final User Flows
Technical User Flow
A technical user installs the application and signs in using phone OTP authentication through Firebase Authentication. After onboarding, the user enters the CalmWave environment where they can access calming audio experiences, grounding exercises, breathing tools, and low-friction behavioral micro-check-ins. The user periodically interacts with tiny check-ins related to sleep quality, exhaustion, stress, social energy, or focus levels. Passive wellness information may also be collected through Google Health Connect integrations such as activity levels, sleep trends, and step counts. All behavioral signals are sent to the backend infrastructure where Azure-based behavioral intelligence systems analyze long-term patterns and identify distress escalation or behavioral anomalies. If worsening behavioral trends are detected, the system may provide supportive interventions, generate alerts for healthcare professionals, or recommend escalation pathways.

Non-Technical User Flow
Non-technical users are supported primarily through ASHA workers, healthcare professionals, wellness cards, and voice-based accessibility systems. ASHA workers assist with onboarding, behavioral observation recording, and wellness tracking. Users may also directly call the voice support number using keypad phones or basic mobile devices. The AI voice system analyzes conversational distress indicators and updates the behavioral intelligence platform. If serious escalation patterns are detected, healthcare workers or support systems receive notifications for follow-up assistance.

Final Technical Architecture
Frontend
The frontend application is being built using React Native with Expo. React Native was chosen because it allows rapid cross-platform development using a single codebase for Android and iOS. Expo simplifies development speed, package integration, asset handling, and testing during the hackathon timeline.
The frontend includes:
OTP authentication screens
CalmWave home screen
check-in screens
breathing and grounding interfaces
wellness timeline
GP interface
IVR interaction screens

Authentication System
Firebase Phone OTP Authentication is used for user login and identity management. Each authenticated user receives a Firebase UID which acts as the permanent identifier for all behavioral records, check-ins, health data, doctor updates, and AI-generated distress scores.
This approach was chosen because:
it is fast to implement
secure
scalable
familiar for Indian users
suitable for healthcare-linked workflows

Passive Health Data
Google Health Connect integration allows the system to access:
sleep duration
step counts
activity levels
heart rate data
with user permission.
This enables passive behavioral intelligence without requiring users to manually enter large amounts of information daily.

Backend Infrastructure
The backend system is being built using Node.js and Express hosted through Azure App Services. The backend acts as the central orchestration layer connecting the frontend, database systems, AI services, voice systems, and healthcare workflows.
The backend handles:
API endpoints
data storage
AI service communication
escalation logic
GP workflows
IVR signal handling
referral systems

Database
MongoDB Atlas acts as the primary behavioral data storage system.
Collections (Mongoose Models) include:
users
checkins
health_aggregates
ivr_signals
visits
distress_flags
MongoDB was chosen to bypass Azure Cosmos DB region restrictions while maintaining a flexible NoSQL structure suitable for rapidly evolving behavioral data.

AI & Communication Infrastructure
*Note: Due to Azure Student subscription region/quota limits, some services have been replaced or mocked to prevent hackathon bottlenecks, while preserving the overall architectural design.*

Azure Anomaly Detector (Currently Mocked)
This service analyzes time-series behavioral patterns such as sleep decline, exhaustion increase, and worsening behavioral signals. Due to deployment constraints, the anomaly score is temporarily mocked (e.g. `anomalyScore = 0.82`) until the real detection API can be integrated later.

Standard OpenAI API & Gemini 2.5 Flash
Replaces Azure OpenAI deployments. Used in a restricted and controlled manner for:
crisis phrase detection
GP support note generation
conversational check-ins over IVR (powered by Gemini)
The system intentionally avoids therapy-style conversational AI.

Azure Speech Services
Used for:
speech-to-text conversion
speech pace analysis
pause density extraction
vocal fatigue indicators

Twilio Voice Webhooks
Replaces Azure Communication Services for the hackathon. Used for:
IVR phone system via Gemini REST API
call routing and session tracking
referral SMS delivery

Final Team Responsibilities
Product & Coordination Lead
Responsible for:
architecture understanding
feature prioritization
workflow consistency
team coordination
demo planning
pitch preparation
UX direction
Frontend Team
Responsible for:
React Native screens
onboarding flow
CalmWave interfaces
GP interfaces
check-in systems
Firebase authentication
Backend & Infrastructure Team
Responsible for:
Node.js APIs
MongoDB Atlas integration
Azure/Gemini AI integrations
anomaly detection (mock logic for now)
escalation logic
GP backend systems
Voice & Accessibility Team
Responsible for:
Twilio IVR infrastructure
Gemini Voice integration
Azure Speech integration
voice analysis pipeline
SMS escalation workflows
UI/UX Team
Responsible for:
Figma designs
emotional UI direction
accessibility-focused layouts
dashboard designs
calming interface systems

Final Demo Story
The demo begins with an emotionally exhausted user entering the CalmWave application through OTP login. The user interacts with calming soundscapes and lightweight behavioral check-ins. Passive health data demonstrates declining sleep and activity trends over time. Azure behavioral intelligence systems identify worsening behavioral patterns and generate a distress anomaly score. A GP interface then visualizes the behavioral deterioration and triggers a referral workflow. Finally, the accessibility layer demonstrates how non-technical users can call a support number through the IVR system, allowing AI-assisted behavioral escalation and ASHA-worker follow-up support.

Final Product Positioning
SWASTHYA is positioned as a hybrid behavioral distress intelligence and emotional support ecosystem that combines calming emotional infrastructure, AI-driven behavioral analysis, healthcare-assisted accessibility systems, and voice-based support pathways into one unified platform designed to support emotionally vulnerable individuals through low-friction, emotionally safe, and behaviorally intelligent interventions.
