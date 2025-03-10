export default function FAQPage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Frequently Asked Questions
          </h1>
          
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn more about using the AI Learning Experience Studio for your educational needs.
          </p>
        </div>
        
        <div className="space-y-6 mt-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">What types of learning experiences can I create?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              You can create several types of AI learning experiences:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li><strong>Roleplay Characters:</strong> Historical figures, industry experts, or case study participants</li>
                <li><strong>Discussion Facilitators:</strong> Guide conversations and explore topics using questioning techniques</li>
                <li><strong>Feedback Coaches:</strong> Provide detailed feedback on assignments, presentations, or projects</li>
                <li><strong>Subject Tutors:</strong> Explain concepts and help students work through course material</li>
                <li><strong>Custom Interactions:</strong> Design your own unique learning experiences</li>
              </ul>
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">What is the AI Learning Experience Studio?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              The AI Learning Experience Studio is an educational platform that allows Imperial College Business School faculty to create immersive, 
              interactive learning experiences powered by AI. Students can engage with roleplay characters, discussion facilitators, feedback coaches, 
              and other AI-powered learning modes to deepen their understanding of various subjects.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">How do I create a learning experience?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              To create a learning experience, navigate to the Create page from the sidebar menu. Select the type of interaction 
              (roleplay character, discussion facilitator, feedback coach, etc.) and fill in all the required 
              information including purpose, context, and interaction instructions. For roleplay experiences, you'll also define the persona. 
              You can upload relevant materials to enhance the AI's knowledge base for any experience type.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">How do students access the learning experiences?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              After creating a learning experience, you'll receive a shareable link and an access code. Share this link with 
              your students along with the access code. Students will need to enter the access code to participate 
              in the learning experience.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Can I edit my learning experiences after creating them?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Yes, you can edit your existing learning experiences by navigating to the Edit section from the sidebar menu. 
              This allows you to modify instructions, change interaction types, upload additional materials, or adjust access settings.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">What AI models power the learning experiences?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              The platform uses advanced language models including GPT-4 Turbo, GPT-4o, and GPT-3.5 Turbo. 
              You can select which model to use when creating your learning experience, with GPT-4 Turbo being the recommended 
              option for the most sophisticated interactions across all experience types.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
