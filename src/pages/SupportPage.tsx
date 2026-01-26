import PageLayout from '../components/PageLayout';
import { Mail, Linkedin, HelpCircle, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupportPage() {
    return (
        <PageLayout 
            title="Support Center" 
            subtitle="How can we help you today? Our team is here to ensure you have the best experience with Handwritten."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 bg-white border border-black/5 rounded-3xl hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                    <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mb-6">
                        <Mail size={24} />
                    </div>
                    <h3 className="mt-0">Email Support</h3>
                    <p className="text-neutral-500 mb-6">
                        Have a specific question or issue? Send us an email and we'll get back to you within 24 hours.
                    </p>
                    <a 
                        href="mailto:arshverma.dev@gmail.com" 
                        className="inline-flex items-center font-bold text-neutral-900 hover:gap-2 transition-all"
                    >
                        arshverma.dev@gmail.com →
                    </a>
                </div>

                <div className="p-8 bg-white border border-black/5 rounded-3xl hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6">
                        <Linkedin size={24} />
                    </div>
                    <h3 className="mt-0">LinkedIn</h3>
                    <p className="text-neutral-500 mb-6">
                        Connect with us on LinkedIn for professional updates and networking.
                    </p>
                    <a 
                        href="https://www.linkedin.com/in/arshvermadev/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center font-bold text-neutral-900 hover:gap-2 transition-all"
                    >
                        Connect on LinkedIn →
                    </a>
                </div>
            </div>

            <h2 className="text-2xl font-display font-black mb-8 text-center sm:text-left">Quick Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/faq" className="p-6 bg-white border border-black/5 rounded-2xl hover:border-neutral-900/20 transition-colors flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                        <HelpCircle size={20} className="text-neutral-600" />
                    </div>
                    <span className="font-bold">Frequently Asked Questions</span>
                </Link>

                <Link to="/terms" className="p-6 bg-white border border-black/5 rounded-2xl hover:border-neutral-900/20 transition-colors flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                        <FileText size={20} className="text-neutral-600" />
                    </div>
                    <span className="font-bold">Terms of Service</span>
                </Link>

                <Link to="/privacy" className="p-6 bg-white border border-black/5 rounded-2xl hover:border-neutral-900/20 transition-colors flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                        <Shield size={20} className="text-neutral-600" />
                    </div>
                    <span className="font-bold">Privacy Policy</span>
                </Link>
            </div>

            <section className="mt-16 p-8 border border-neutral-200 border-dashed rounded-3xl text-center">
                <h3 className="mt-0">Need a feature?</h3>
                <p className="text-neutral-500 max-w-lg mx-auto mb-6">
                    We're always looking to improve. If you have an idea for a feature that would make Handwritten better for you, let us know!
                </p>
                <button className="text-neutral-900 font-bold underline underline-offset-4 hover:text-neutral-600">
                    Request a Feature
                </button>
            </section>
        </PageLayout>
    );
}
