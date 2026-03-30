export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">About Us</h1>
      <div className="prose prose-slate lg:prose-lg">
        <p>
          Welcome to FreelanceHub, the premier marketplace connecting top-tier freelance talent with businesses worldwide. 
          Our mission is to simplify the hiring process and provide a secure, transparent platform for both freelancers and clients.
        </p>
        <p>
          Founded in 2026, we recognized the need for a platform that prioritizes quality and direct communication. 
          Unlike traditional marketplaces that take a huge cut of every transaction, our subscription model allows clients to unlock contact details and work directly with freelancers, saving money and fostering long-term relationships.
        </p>
        <h2>Our Values</h2>
        <ul>
          <li><strong>Transparency:</strong> Clear pricing and no hidden fees.</li>
          <li><strong>Quality:</strong> We vet our freelancers to ensure high standards.</li>
          <li><strong>Empowerment:</strong> Giving freelancers the tools they need to succeed.</li>
        </ul>
      </div>
    </div>
  );
}
