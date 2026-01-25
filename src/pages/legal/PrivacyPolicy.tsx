import PageLayout from '../../components/PageLayout';

export default function PrivacyPolicy() {
    return (
        <PageLayout 
            title="Privacy Policy" 
            subtitle="Your privacy is critically important to us. We believe in transparency and data minimalism."
        >
            <h3>1. Introduction</h3>
            <p>
                Welcome to Handwritten ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our website.
            </p>
            <p>
                By accessing or using our services, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
            </p>

            <h3>2. Data Collection (Local Storage)</h3>
            <p>
                <strong>Important:</strong> Handwritten is designed with a "Local-First" architecture. 
            </p>
            <ul>
                <li><strong>No Cloud Storage:</strong> We do not store your documents, text, or exported files on our servers. All processing happens locally in your browser.</li>
                <li><strong>Local Storage:</strong> Your preferences (theme, font choice, etc.) and history are stored in your device's <code>localStorage</code> or <code>IndexedDB</code>. This data never leaves your device unless you explicitly export it.</li>
            </ul>

            <h3>3. Artificial Intelligence Features</h3>
            <p>
                When you use our "AI Humanizer" feature, the text you submit is sent to a third-party LLM provider (OpenRouter/OpenAI) for processing. 
            </p>
            <ul>
                <li>The data sent is ephemeral and is only used to generate the response.</li>
                <li>We do not store logs of your text content on our servers.</li>
                <li>Please review OpenRouter's privacy policy for details on how they handle API requests.</li>
            </ul>

            <h3>4. Cookies and Tracking</h3>
            <p>
                We use minimal cookies strictly necessary for the operation of the website (e.g., to remember your settings). We may use third-party analytics tools (like Google Analytics) to understand website traffic, which may use cookies. You can disable cookies through your browser settings.
            </p>

            <h3>5. Contact Us</h3>
            <p>
                If you have questions about this policy, please contact us at: <a href="mailto:support@handwritten.app">support@handwritten.app</a>
            </p>

            <p className="text-sm text-neutral-400 mt-8">
                Last updated: January 26, 2026
            </p>
        </PageLayout>
    );
}
