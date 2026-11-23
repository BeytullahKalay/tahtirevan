import Link from "next/link";
import { href, type Lang } from "@/lib/i18n";

export type LegalKey = "privacy" | "cookies" | "care" | "press";

type Doc = { label: string; title: string; intro: string; sections: [string, string][]; draft?: boolean };

const DOCS: Record<LegalKey, Record<Lang, Doc>> = {
  privacy: {
    tr: {
      label: "Gizlilik ve KVKK",
      title: "Kişisel verileriniz",
      intro: "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ve AB Genel Veri Koruma Tüzüğü (GDPR) kapsamında hazırlanacak aydınlatma metninin taslağıdır.",
      draft: true,
      sections: [
        ["Hangi verileri topluyoruz", "Görüşme formunda paylaştığınız ad soyad, e-posta, telefon, ülke ve şehir, ilgilendiğiniz parça, proje türü ve notunuz. Bülten için yalnızca e-posta adresiniz."],
        ["Neden topluyoruz", "Görüşme talebinize yanıt vermek, numune ve katalog göndermek ve onay verdiyseniz atölyeden mektuplar iletmek için."],
        ["Ne kadar saklıyoruz", "Talebiniz sonuçlandıktan sonra yasal saklama süreleri boyunca. Bülten aboneliğinizi istediğiniz an sonlandırabilirsiniz."],
        ["Haklarınız", "Verilerinize erişme, düzeltme, silme ve işlemeye itiraz etme hakkınız vardır. Talepleriniz için görüşme sayfasındaki formu kullanabilirsiniz."],
      ],
    },
    en: {
      label: "Privacy",
      title: "Your personal data",
      intro: "This is a draft of the privacy notice to be prepared under Turkey's Personal Data Protection Law (KVKK) and the EU General Data Protection Regulation (GDPR).",
      draft: true,
      sections: [
        ["What we collect", "The name, email, telephone, country and city, piece of interest, project type and note you share in the consultation form. For the newsletter, only your email address."],
        ["Why we collect it", "To answer your consultation request, to send samples and catalogues, and, if you have agreed, to send letters from the atelier."],
        ["How long we keep it", "For the legal retention period after your request is complete. You can end your newsletter subscription at any time."],
        ["Your rights", "You may access, correct or erase your data, and object to its processing. Use the form on the consultation page to make a request."],
      ],
    },
  },
  cookies: {
    tr: {
      label: "Çerez politikası",
      title: "Çerezler",
      intro: "Site, çalışmak için çereze ihtiyaç duymaz. Tercihleriniz yalnızca tarayıcınızda saklanır.",
      draft: true,
      sections: [
        ["Zorunlu", "Dil tercihi ve çerez kararınız tarayıcınızın yerel depolamasında tutulur. Bunlar size ait bilgilerdir ve bize gönderilmez."],
        ["Ölçüm", "Yalnızca onay verirseniz, çerez kullanmayan ve kimliğinizi belirlemeyen bir ölçüm aracı (Plausible) yüklenir. Onayınızı istediğiniz an tarayıcı verilerini silerek geri alabilirsiniz."],
        ["Pazarlama", "Reklam ya da takip çerezi kullanmıyoruz."],
      ],
    },
    en: {
      label: "Cookie policy",
      title: "Cookies",
      intro: "The site does not need cookies to work. Your preferences are stored in your own browser only.",
      draft: true,
      sections: [
        ["Essential", "Your language and your cookie decision are kept in your browser's local storage. They belong to you and are never sent to us."],
        ["Measurement", "Only with your consent, a cookie-free measurement tool that does not identify you (Plausible) is loaded. You can withdraw consent at any time by clearing your browser data."],
        ["Marketing", "We use no advertising or tracking cookies."],
      ],
    },
  },
  care: {
    tr: {
      label: "Bakım kılavuzu",
      title: "Bir ömür için bakım",
      intro: "Bir Tahtırevan, nesilden nesile geçmek için yapılır. Birkaç alışkanlık bunu kolaylaştırır.",
      sections: [
        ["Işık", "Parçayı doğrudan güneş ışığından uzak tutun. Desenin renkleri en çok güneşte yorulur."],
        ["Kumaş", "Haftada bir yumuşak bir fırçayla, desenin yönünde fırçalayın. Lekede ovalamayın; temiz, kuru bir bezle bastırarak alın ve bize yazın."],
        ["Ahşap", "Yağ kaplamalı gövdeleri yılda bir kez atölyenin gönderdiği yağ ile besleyin. Lake ve varak yüzeyleri yalnızca kuru, yumuşak bir bezle silin."],
        ["Ortam", "Gövde ahşabı nefes alır. Radyatör ve klima çıkışlarından en az bir metre uzakta, dengeli nemde en iyi hâlini korur."],
        ["Bakım ve yeniden döşeme", "Onarım, yeniden döşeme ya da bakım için parça numaranızla bize her zaman ulaşabilirsiniz."],
      ],
    },
    en: {
      label: "Care guide",
      title: "Care for a lifetime",
      intro: "A Tahtırevan is made to pass from one generation to the next. A few habits make that easy.",
      sections: [
        ["Light", "Keep the piece out of direct sunlight. Sun is what tires a pattern's colours most."],
        ["Fabric", "Once a week, brush gently with a soft brush in the direction of the pattern. Never rub a stain: blot it with a clean, dry cloth and write to us."],
        ["Wood", "Feed oiled frames once a year with the oil the atelier sends you. Wipe lacquer and gold leaf with a dry, soft cloth only."],
        ["Surroundings", "The wood of the frame breathes. It keeps best at even humidity, at least a metre from radiators and air vents."],
        ["Care and reupholstery", "For repairs, reupholstery or care, you can always reach us with your piece number."],
      ],
    },
  },
  press: {
    tr: {
      label: "Basın",
      title: "Basın",
      intro: "Basın kiti; marka hikâyesi, desen kodları, yüksek çözünürlüklü fotoğraflar ve atölye bilgilerini içerir.",
      sections: [
        ["Basın kiti", "Basın kiti, ilk fotoğraf çekimleri tamamlandığında burada indirilebilir olacak. Şimdilik talep formu üzerinden gönderiyoruz."],
        ["Görüşme ve atölye ziyareti", "Röportaj, çekim ya da atölye ziyareti için talebinizi iletin; en geç 24 saat içinde döneriz."],
      ],
    },
    en: {
      label: "Press",
      title: "Press",
      intro: "The press kit holds the brand story, the pattern codes, high-resolution photography and atelier details.",
      sections: [
        ["Press kit", "The press kit will be available to download here once the first photography is complete. Until then, we send it on request."],
        ["Interviews and atelier visits", "Send us your request for an interview, a shoot or a visit to the atelier, and we will reply within 24 hours."],
      ],
    },
  },
};

export function LegalView({ lang, doc }: { lang: Lang; doc: LegalKey }) {
  const d = DOCS[doc][lang];
  return (
    <article className="px-[var(--gutter)] pb-[16vh] pt-36 lg:pt-48">
      <header className="max-w-[900px]">
        <p className="label">{d.label}</p>
        <h1 className="display-md mt-4">{d.title}</h1>
        <p className="lede mt-6 max-w-[56ch] !text-tas">{d.intro}</p>
        {d.draft && (
          <p className="label mt-6 !text-altin">
            {lang === "tr" ? "Taslak · hukuki inceleme bekliyor" : "Draft · awaiting legal review"}
          </p>
        )}
      </header>
      <div className="mt-16 max-w-[900px]">
        {d.sections.map(([h, p]) => (
          <section key={h} className="grid gap-4 border-t hairline py-8 md:grid-cols-3">
            <h2 className="font-serif text-2xl">{h}</h2>
            <p className="text-fildisi/85 md:col-span-2">{p}</p>
          </section>
        ))}
      </div>
      {doc === "press" && (
        <Link href={`${href(lang, "consultation")}?talep=basin`} className="btn mt-12">
          {lang === "tr" ? "Basın kitini talep edin" : "Request the press kit"}
        </Link>
      )}
    </article>
  );
}

export const LEGAL_META: Record<LegalKey, Record<Lang, { title: string; description: string }>> = {
  privacy: {
    tr: { title: "Gizlilik ve KVKK", description: "Tahtırevan'ın kişisel verileri nasıl işlediği." },
    en: { title: "Privacy", description: "How Tahtırevan handles personal data." },
  },
  cookies: {
    tr: { title: "Çerez politikası", description: "Tahtırevan sitesinde kullanılan çerezler ve tercihler." },
    en: { title: "Cookie policy", description: "Cookies and preferences on the Tahtırevan site." },
  },
  care: {
    tr: { title: "Bakım kılavuzu", description: "Tahtırevan koltuk, kanepe ve sedirleri için bakım önerileri." },
    en: { title: "Care guide", description: "Care advice for Tahtırevan armchairs, sofas and daybeds." },
  },
  press: {
    tr: { title: "Basın", description: "Tahtırevan basın kiti ve basın talepleri." },
    en: { title: "Press", description: "Tahtırevan press kit and press enquiries." },
  },
};
