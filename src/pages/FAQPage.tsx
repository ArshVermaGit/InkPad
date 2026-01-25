import PageLayout from '../components/PageLayout';

export default function FAQPage() {
    return (
        <PageLayout 
            title="Help Center" 
            subtitle="Frequently asked questions about Handwritten."
        >
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Is Handwritten free to use?</h3>
                    <p>Yes! The core text-to-handwriting features are completely free. We may offer premium features in the future, but the essential tools will remain accessible.</p>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Can I upload my own font?</h3>
                    <p>Currently, we only support a curated list of high-quality Google Fonts that work well with our jitter/pressure simulation. Custom font support is on our roadmap!</p>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">My text is getting cut off in the PDF export. Why?</h3>
                    <p>This usually happens due to browser rendering differences. Try adjusting the "Page Margins" in the settings panel or reducing the font size slightly before exporting.</p>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Is my data secure?</h3>
                    <p>Absolutely. We use a "Local-First" architecture. All document processing happens directly in your browser. We don't store your documents on our servers.</p>
                </div>
            </div>
        </PageLayout>
    );
}
