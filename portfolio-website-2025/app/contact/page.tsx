'use client';

import React, { useRef, useState } from 'react';

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const body = new FormData(formRef.current);

      // Optional: set a useful subject on the Formspree email
      const computedSubject =
        formData.subject?.trim() ||
        `New message from ${formData.firstName || 'Unknown'} ${formData.lastName || ''}`.trim();
      body.set('_subject', computedSubject);

      const resp = await fetch('https://formspree.io/f/mqadzlee', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body
      });

      if (resp.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
        formRef.current.reset();
      } else {
        const data = await resp.json().catch(() => null);
        setStatus('error');
        setErrorMsg(data?.errors?.[0]?.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-32 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - About Me */}
          <div>
            <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-[67px] font-bold mb-1 leading-none tracking-tighter" style={{ color: '#343330' }}>
              Discover more
            </h1>
            <h2 className="text-5xl sm:text-5xl md:text-6xl lg:text-[67px] font-bold mb-6 leading-none tracking-tighter" style={{ color: '#343330' }}>
              about me
            </h2>
            <p className="lg:text-[20px] md:text-[16px] sm:text-[10px] text-[#9D231B] mb-8">
              Let's explore more about who I am as a person.
            </p>

            <div>
              <div className="border border-[#9D231B] rounded-tl-md rounded-tr-md p-6 bg-white">
                <div className="flex items-start">
                  <div className="text-[#9D231B] mr-3 mt-1">✓</div>
                  <p className="text-[#343330]">
                    Senior Computer Science Undergraduate at The University of Texas at Dallas with a strong focus in full-stack web development and quality engineering.
                  </p>
                </div>
              </div>

              <div className="border-l border-r border-b border-[#9D231B] p-6 bg-white">
                <div className="flex items-start">
                  <div className="text-[#9D231B] mr-3 mt-0">✓</div>
                  <p className="text-[#343330]">
                    Current Software Engineer at Ayoka Systems.
                  </p>
                </div>
              </div>

              <div className="border-l border-r border-b border-[#9D231B] p-6 bg-white">
                <div className="flex items-start">
                  <div className="text-[#9D231B] mr-3 mt-1">✓</div>
                  <p className="text-[#343330]">
                    Former 2 time intern (Software Development and Quality Engineering) at Signet Jewelers
                  </p>
                </div>
              </div>

              <div className="border-l border-r border-b border-[#9D231B] rounded-bl-md rounded-br-md p-6 bg-white">
                <div className="flex items-start">
                  <div className="text-[#9D231B] mr-3 mt-1">✓</div>
                  <p className="text-[#343330]">
                    Former Summer 2023 Software Development Intern at Southwest Solutions Group
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-[16px] font-bold text-[#343330] mb-1">
                    First Name<span style={{ color: '#9D231B' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                    className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-[16px] font-bold text-[#343330] mb-1">
                    Last Name<span style={{ color: '#9D231B' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                    className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-[16px] font-bold text-[#343330] mb-1">
                  Email<span style={{ color: '#9D231B' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-[16px] font-bold text-[#343330] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter the subject"
                  className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-[16px] font-bold text-[#343330] mb-1">
                  Message<span style={{ color: '#9D231B' }}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your message"
                  rows={6}
                  required
                  className="w-full px-3 py-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B] resize-vertical"
                />
              </div>

              {/* Hidden helpers for Formspree */}
              <input type="hidden" name="_subject" value="" />
              {/* If you want Formspree to redirect after success, uncomment below and set a URL: */}
              {/* <input type="hidden" name="_redirect" value="https://your-site.com/thank-you" /> */}

              {/* Required Fields Notice */}
              <p className="text-[12px] font-bold" style={{ color: '#9D231B' }}>
                Fields marked with an asterisk (*) are required.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ backgroundColor: '#9D231B', border: '1px solid #343330' }}
                className="hover:opacity-90 text-white rounded font-medium py-3 px-12 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                {status === 'loading' ? 'Submitting…' : 'Submit'}
              </button>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="text-green-700 text-sm font-medium">Thanks! Your message has been sent.</div>
              )}
              {status === 'error' && (
                <div className="text-red-700 text-sm font-medium">
                  {errorMsg || 'There was a problem sending your message.'}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
