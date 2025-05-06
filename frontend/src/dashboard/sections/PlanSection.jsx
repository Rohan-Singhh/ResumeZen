import React from 'react';

export default function PlanSection({ plans, onPurchase }) {
  return (
    <div id="pricing-section" className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Buy More Resume Checks</h2>
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div key={index} className={`border rounded-lg p-4 hover:border-primary transition-colors ${plan.title === 'Unlimited Pack' ? 'bg-primary/5' : ''}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{plan.title || `${plan.checks} ${plan.checks === 1 ? 'Check' : 'Checks'}`}</p>
                {plan.description && <p className="text-sm text-gray-600 mt-1">{plan.description}</p>}
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-bold text-primary">{plan.price}</p>
                  <span className="text-gray-600 ml-1">{plan.period ? `/${plan.period}` : ''}</span>
                </div>
              </div>
              <button onClick={() => onPurchase(plan)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">Buy Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 