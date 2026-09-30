import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import SectionHeading from './ui/SectionHeading';
import Field, { Input, Textarea } from './ui/Field';
import Segmented from './ui/Segmented';
import Button from './ui/Button';
import Modal, { ModalHeader } from './ui/Modal';
import { reveal } from '../utils/motion';

const contactMethods = [
  {
    id: 1,
    icon: EnvelopeIcon,
    title: 'Email',
    detail: 'support@resumezen.com',
    response: 'Reply within 24 hours',
  },
  {
    id: 2,
    icon: PhoneIcon,
    title: 'Phone',
    detail: '+91 (800) 123-4567',
    response: '9 AM – 6 PM IST',
  },
  {
    id: 3,
    icon: ChatBubbleLeftRightIcon,
    title: 'Live chat',
    detail: 'On this site',
    response: 'Usually within 5 minutes',
  },
  {
    id: 4,
    icon: BookOpenIcon,
    title: 'Help center',
    detail: 'help.resumezen.com',
    response: 'Open around the clock',
  },
];

const PRIORITIES = ['Low', 'Normal', 'Urgent'].map((p) => ({ value: p, label: p }));
const MAX_CHARACTERS = 500;

export default function Support() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/support', {
        name,
        email,
        subject,
        priority: selectedPriority,
        message,
      });

      if (response.data.success) {
        setShowModal(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setSelectedPriority('Normal');
      }
    } catch (err) {
      setFormError(err.response?.data?.error || "Your message didn't send. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="support" className="section border-t border-line">
      <div className="shell">
        <SectionHeading
          index="06"
          eyebrow="Support"
          title={<>Stuck? <em className="t-em">Write to us.</em></>}
          lead="Questions about a report, a plan or your account. Pick whichever way of reaching us suits you."
        />

        {/* Ways to reach us: one ruled row, not four boxes. The 1px gaps over
            a line-colored ground draw the rules at every column count. */}
        <motion.dl {...reveal()} className="grid grid-cols-1 gap-px border-y border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {contactMethods.map((method) => (
            <div key={method.id} className="bg-surface-void py-6 sm:px-6 lg:first:pl-0">
              <dt className="t-label flex items-center gap-2">
                <method.icon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                {method.title}
              </dt>
              <dd className="mt-3.5 text-[0.9375rem] font-medium text-ink">{method.detail}</dd>
              <dd className="mt-1 text-[0.8125rem] text-ink-faint">{method.response}</dd>
            </div>
          ))}
        </motion.dl>

        <motion.div
          {...reveal(0.05)}
          className="mt-12 grid grid-cols-1 overflow-hidden rounded-xl border border-line bg-surface shadow-e1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
        >
          <div className="border-b border-line p-7 sm:p-10 lg:border-b-0 lg:border-r">
            <h3 className="t-h2">Send a message</h3>
            <p className="t-body mt-4 max-w-sm">
              Tell us what happened and what you expected. The more specific, the faster we can help.
            </p>
            <ul className="mt-8 space-y-4 border-t border-line pt-7">
              {[
                'A reply within 24 hours, from a person.',
                'Mark it urgent if you are mid-application.',
                'Include the email you sign in with, so we can find your account.',
              ].map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                  <span aria-hidden="true" className="mt-[0.68em] h-[2px] w-3 flex-shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <form className="space-y-6 p-7 sm:p-10" onSubmit={handleSubmit}>
            <AnimatePresence>
              {formError && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="flex items-start gap-2.5 rounded-md border border-bad/25 bg-bad/10 px-4 py-3 text-sm text-bad">
                    <ExclamationCircleIcon className="mt-px h-5 w-5 flex-shrink-0" />
                    {formError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Name">
                {(p) => <Input {...p} type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />}
              </Field>
              <Field label="Email">
                {(p) => <Input {...p} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />}
              </Field>
            </div>

            <Field label="Subject">
              {(p) => <Input {...p} type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What is this about?" />}
            </Field>

            <div>
              <p className="mb-2 text-[0.8125rem] font-medium text-ink-muted">Priority</p>
              <Segmented label="Priority" options={PRIORITIES} value={selectedPriority} onChange={setSelectedPriority} />
            </div>

            <Field label="Message" aside={`${message.length} / ${MAX_CHARACTERS}`}>
              {(p) => (
                <Textarea
                  {...p}
                  required
                  rows={4}
                  maxLength={MAX_CHARACTERS}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What happened, and what did you expect?"
                  className="resize-none"
                />
              )}
            </Field>

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
              Send message
            </Button>
          </form>
        </motion.div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} labelledBy="support-sent-title" maxWidth="max-w-sm">
        <ModalHeader id="support-sent-title" icon={CheckCircleIcon} tone="good" onClose={() => setShowModal(false)}>
          Message sent
        </ModalHeader>
        <p className="t-body mb-6">
          Thanks for writing. It is in the queue, and someone will reply by email.
        </p>
        <Button variant="secondary" onClick={() => setShowModal(false)} className="w-full">Done</Button>
      </Modal>
    </section>
  );
}
