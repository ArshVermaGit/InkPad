import PageLayout from '../../components/PageLayout';

export default function TermsOfService() {
    return (
        <PageLayout 
            title="Terms of Service" 
            subtitle="Please read these terms carefully before using our service."
        >
            <h3>1. Acceptance of Terms</h3>
            <p>
                By accessing and using Handwritten (the "Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3>2. Use License</h3>
            <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Handwritten's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
                <li>Modify or copy the materials for commercial reselling (you MAY use the exported documents for any purpose).</li>
                <li>Attempt to decompile or reverse engineer any software contained on Handwritten's website.</li>
                <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>

            <h3>3. Disclaimer</h3>
            <p>
                The materials on Handwritten's website are provided on an 'as is' basis. Handwritten makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h3>4. Limitations</h3>
            <p>
                In no event shall Handwritten or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Handwritten's website.
            </p>

            <h3>5. Revisions</h3>
            <p>
                The materials appearing on Handwritten's website could include technical, typographical, or photographic errors. Handwritten does not warrant that any of the materials on its website are accurate, complete, or current.
            </p>

            <p className="text-sm text-neutral-400 mt-8">
                Last updated: January 26, 2026
            </p>
        </PageLayout>
    );
}
