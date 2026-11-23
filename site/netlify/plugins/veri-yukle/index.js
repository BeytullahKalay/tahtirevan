// Netlify derleme eklentisi (netlify.toml → [[plugins]]).
// Netlify Blobs erişimi derleme komutuna verilmiyor, yalnızca eklentilere veriliyor. Bu eklenti erişimi
// derleme komutuna aktarır; böylece scripts/netlify-veri-yukle.mjs `npm run netlify:veri` ile yüklenen veriyi okuyabilir.
// Değerler yalnızca bu derlemede geçerlidir; çalışan siteye (fonksiyonlara) geçmez.
export const onPreBuild = ({ netlifyConfig, constants }) => {
  const env = netlifyConfig.build.environment;
  if (process.env.NETLIFY_BLOBS_CONTEXT) env.NETLIFY_BLOBS_CONTEXT = process.env.NETLIFY_BLOBS_CONTEXT;
  if (constants.SITE_ID) env.VERI_SITE_ID = constants.SITE_ID;
  if (constants.NETLIFY_API_TOKEN) env.VERI_TOKEN = constants.NETLIFY_API_TOKEN;
  console.log(
    `[veri-yukle] Blobs erişimi derleme komutuna aktarıldı (${process.env.NETLIFY_BLOBS_CONTEXT ? "bağlam" : constants.NETLIFY_API_TOKEN ? "anahtar" : "yok"}).`,
  );
};
