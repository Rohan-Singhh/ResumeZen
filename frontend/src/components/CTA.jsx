import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import InkLandscape from './graphics/InkLandscape';
import Button from './ui/Button';
import { reveal } from '../utils/motion';

/**
 * Closing scene. The same country as the hero, later in the day: the sun is
 * going down behind a low range and the page ends where it began.
 */
export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="px-3 pb-3 pt-10 sm:px-5 sm:pb-5">
      <div className="relative isolate overflow-hidden rounded-2xl border border-line pb-[19rem] pt-20 sm:pb-[22rem] sm:pt-24">
        <InkLandscape
          seed={29}
          horizon={0.86}
          relief={0.6}
          sun="left-1/2 bottom-[-9rem] h-[22rem] w-[22rem] -translate-x-1/2 sm:bottom-[-12rem] sm:h-[30rem] sm:w-[30rem]"
          className="absolute inset-0 -z-10"
        />

        <motion.div {...reveal()} className="shell text-center">
          <h2 className="t-display mx-auto max-w-[14ch] !text-[clamp(2.5rem,6.4vw,5rem)]">
            Send the <em className="t-em">better</em> draft.
          </h2>
          <p className="t-lead mx-auto mt-6 max-w-md">
            One upload, about a minute, and you know what to fix before anyone else reads it.
          </p>
          <div className="mt-9 flex justify-center">
            <Button size="lg" onClick={() => navigate('/login')} className="group">
              Get your report
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
