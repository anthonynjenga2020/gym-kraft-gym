import React from 'react';

export default function MembershipBenefits({ config }) {
  return (
    <section id="membership-benefits" className="py-12 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <h2 className="text-3xl font-bold mb-6 text-center">Why Join Our Membership?</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.membershipBenefits?.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
