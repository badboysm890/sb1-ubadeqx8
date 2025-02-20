import { useState } from 'react';
import { Building2, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './LoadingSpinner';

export function CompanySetup() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'individual' | 'employee' | null>(null);
  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    domain: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const handleUserTypeSelect = (type: 'individual' | 'employee') => {
    setUserType(type);
    setStep(type === 'individual' ? 3 : 2);
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (userType === 'individual') {
        // Create default Smortr company for individual users with unique domain
        const uniqueDomain = `smortr-user-${profile?.id}`;
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            name: 'Smortr User',
            domain: uniqueDomain,
            address: 'Individual Account',
          })
          .select()
          .single();

        if (companyError) throw companyError;
      } else {
        // Check if company with domain already exists
        const { data: existingCompany, error: checkError } = await supabase
          .from('companies')
          .select('id')
          .eq('domain', companyDetails.domain)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingCompany) {
          // If company exists, just update the user's profile with the existing company_id
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ company_id: existingCompany.id })
            .eq('id', profile?.id);

          if (updateError) throw updateError;
        } else {
          // Create new company if it doesn't exist
          const { error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyDetails.name,
              domain: companyDetails.domain,
              address: companyDetails.address,
            })
            .select()
            .single();

          if (companyError) throw companyError;
        }
      }

      navigate('/projects');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to set up company. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="https://framerusercontent.com/images/rLmrjpWWFPyTOfn61iSNoIOn8k.png?scale-down-to=512&lossless=1"
            alt="Smortr"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Smortr
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get you set up
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-center">
              How would you like to use Smortr?
            </h3>
            <button
              onClick={() => handleUserTypeSelect('employee')}
              className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-[#1E293B] hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#1E293B]" />
                <div className="text-left">
                  <div className="font-medium">Company Employee</div>
                  <div className="text-sm text-gray-500">
                    I work for a company
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleUserTypeSelect('individual')}
              className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-[#1E293B] hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#1E293B]" />
                <div className="text-left">
                  <div className="font-medium">Individual</div>
                  <div className="text-sm text-gray-500">
                    I'm using Smortr for myself
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <div>
              <label
                htmlFor="company-name"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <input
                type="text"
                id="company-name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E293B] focus:border-[#1E293B]"
                value={companyDetails.name}
                onChange={(e) =>
                  setCompanyDetails({ ...companyDetails, name: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="company-domain"
                className="block text-sm font-medium text-gray-700"
              >
                Company Domain
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="company-domain"
                  required
                  placeholder="example.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E293B] focus:border-[#1E293B]"
                  value={companyDetails.domain}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      domain: e.target.value.toLowerCase(),
                    })
                  }
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your company's domain name (e.g., company.com)
                </p>
              </div>
            </div>
            <div>
              <label
                htmlFor="company-address"
                className="block text-sm font-medium text-gray-700"
              >
                Company Address
              </label>
              <textarea
                id="company-address"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E293B] focus:border-[#1E293B]"
                value={companyDetails.address}
                onChange={(e) =>
                  setCompanyDetails({ ...companyDetails, address: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E293B] hover:bg-[#2d3748] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E293B] disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Complete Setup'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                You'll be set up with an individual account. You can always upgrade
                to a company account later.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E293B] hover:bg-[#2d3748] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E293B] disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Complete Setup'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}