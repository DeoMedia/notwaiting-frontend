import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import waveImage from '../../imports/Manifestobg.png';

export default function Manifesto() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ── MOBILE ───────────────────────────────────────────── */}
      <section className="md:hidden px-6 py-16">
        <div className="max-w-lg mx-auto space-y-8 text-center">
          <h1 className="font-druk text-3xl leading-tight text-[#0C0C0A]">
            {t('manifestoPage.titleLine1')}<br />{t('manifestoPage.titleLine2')}
          </h1>
          <img
            src={waveImage}
            alt=""
            aria-hidden="true"
            className="w-full h-auto object-contain mx-auto max-w-xs"
          />
          <div className="space-y-4 font-mono text-sm leading-relaxed text-[#0C0C0A] text-left">
            <p>{t('manifestoPage.p1')}</p>
            <p>{t('manifestoPage.p2')}</p>
            <p>{t('manifestoPage.p3')}</p>
            <p>{t('manifestoPage.p4')}</p>
            <p>{t('manifestoPage.p5')}</p>
            <p>{t('manifestoPage.p6')}</p>
          </div>
          <p className="font-druk text-xl text-[#0C0C0A]">
            "I am <span className="font-custard normal-case">#NotWaiting</span>."
          </p>
          <Link to="/">
            <Button className="font-mono bg-[#DD3935] hover:bg-[#C92F2B] text-white px-8 py-3 rounded-full uppercase">
              {t('manifestoPage.joinCta')}
            </Button>
          </Link>
        </div>
      </section>

      {/* ── DESKTOP ──────────────────────────────────────────── */}
      {/*
        Layout matches the reference image:
        - Image fills full width, no padding
        - Title sits inside the top of the green shape (~top 8%)
        - Body copy fills the green shape area (~top 20%)
        - "I am #NotWaiting." sits below body, still inside green (~top 55%)
        - Button below the wave mark at bottom (~bottom 5%)
      */}
      <section className="hidden md:block w-full">
        <div className="relative w-full">

          {/* Wave image — full width, no constraints */}
          <img
            src={waveImage}
            alt=""
            aria-hidden="true"
            className="w-full h-auto object-cover block"
          />

          {/*
            HEADING — "Opportunity Africa Manifesto"
            Positioned inside the top of the green shape.
            NOT uppercase — reference image shows mixed case.
            font-druk for weight, but normal capitalisation.
            White text to show against the dark green background.
          */}
          <div className="absolute top-[7%] left-[35%] w-[34%] text-center">
            <h1 className="font-druk text-xl md:text-2xl lg:text-3xl leading-tight text-white">
              {t('manifestoPage.titleLine1')}
              <br />
              {t('manifestoPage.titleLine2')}
            </h1>
          </div>

          {/*
            BODY COPY — inside the green shape
            font-mono, white text, centered, small size to fit the shape
          */}
          <div className="absolute top-[19%] left-[23%] w-[37%] text-center">
            <div className="space-y-2 font-mono text-[9px] md:text-[11px] lg:text-[13px] leading-snug text-white">
              <p>{t('manifestoPage.p1')}</p>
              <p>{t('manifestoPage.p2')}</p>
              <p>{t('manifestoPage.p3')}</p>
              <p>{t('manifestoPage.p4')}</p>
              <p>{t('manifestoPage.p5')}</p>
              <p>{t('manifestoPage.p6')}</p>
            </div>
          </div>

          {/*
            CLOSING — "I am #NotWaiting."
            Still inside the green shape, below body copy.
            Large and bold. #NotWaiting in Custard font.
          */}
          <div className="absolute top-[54%] left-[30%] w-[37%] text-center">
            <p className="font-druk text-sm md:text-base lg:text-4xl text-white">
              "I am <span className="font-custard normal-case">#NotWaiting</span>."
            </p>
          </div>

          {/* CTA BUTTON — centred below the wave mark */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[4%] z-20">
            <Link to="/">
              <Button className="font-mono bg-[#DD3935] hover:bg-[#C92F2B] text-white text-sm md:text-base px-10 py-4 rounded-full uppercase">
                {t('manifestoPage.joinCta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}