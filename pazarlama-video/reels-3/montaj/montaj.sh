#!/usr/bin/env bash
# Reels 3 montajı. reels-3 klasöründen çalıştır: bash montaj/montaj.sh
set -e
export PATH="/c/Users/Beytullah KALAY/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin:$PATH"
mkdir -p montaj/ara montaj/cikti montaj/kart

ENC="-an -r 24 -c:v libx264 -crf 12 -preset medium -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709"
TO_RGB="scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=gbrp"
TO_YUV="scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"
GEOM="scale=1080:-2:flags=lanczos,crop=1080:1920"
CURVE1="curves=all='0/0 0.12/0.15 0.35/0.46 0.7/0.8 1/1'"
# Işıklar kapalı: koyulaştır, hafif maviye çek
DARK="curves=all='0/0 0.3/0.10 0.6/0.27 1/0.55',colorbalance=bs=0.04:bm=0.02:rs=-0.02"

# kesit <sıra> <klip> <ilk kare> <kare sayısı> [ek filtre]
kesit() {
  local extra="${5:-null}"
  ffmpeg -v error -y -i "klipler/$2" -vf "trim=start_frame=$3,setpts=PTS-STARTPTS,$GEOM,$TO_RGB,$CURVE1,$TO_YUV,$extra" \
    -frames:v "$4" $ENC "montaj/ara/$1.mp4"
}

# 1) Işıklar kapalı, 36 kare (1,5 sn). Klip 2'nin ilk karesiyle aynı geometri.
ffmpeg -v error -y -loop 1 -i kareler/k1-kapali.png -vf "scale=1072:1928:flags=lanczos,$GEOM,format=gbrp,$DARK,$TO_YUV" \
  -frames:v 36 $ENC montaj/ara/01.mp4

# 2) Yay: ışıklar yanar (ilk 3 karede parlama)
kesit 02 2-yay.mp4 2 96 "eq=eval=frame:brightness='if(lt(n,3),0.10*(3-n)/3,0)'"
kesit 03 3-makro.mp4 2 48
kesit 04 4-alcak.mp4 2 48
# 5) Açılan kumaş: 62-79 arası desen bozuluyor, atlanır (vuruşta sıçrama kesmesi)
kesit 05a 5-acilan.mp4 14 48
kesit 05b 5-acilan.mp4 80 40
kesit 06 6-yuksek.mp4 16 104

# Kart: Mayura şeridi + logo, 48 kare
ffmpeg -v error -y -i ../../kumas-buyutulmus/mayura-hd.jpg -vf "crop=3000:1655:0:(ih-1655)/2,scale=1160:640:flags=lanczos" -frames:v 1 montaj/kart/serit-mayura.png
ffmpeg -v error -y -f lavfi -i "color=c=0x14110F:s=1080x1920:r=24:d=2" -loop 1 -i montaj/kart/serit-mayura.png -loop 1 -i ../reels-2/montaj/kart/logo-kart.png \
  -filter_complex "[1]format=rgba,colorchannelmixer=aa=0.20[s];[0][s]overlay=x='-40+t*15':y=(H-h)/2[a];[2]format=rgba,fade=in:st=0.15:d=0.5:alpha=1[l];[a][l]overlay=0:0,format=gbrp,$TO_YUV" \
  -frames:v 48 $ENC montaj/ara/kart.mp4

# Birleştir: gövde (420 kare) + karta 0,5 sn geçiş = 456 kare (19 sn). Müzik 13,8 sn'den: ilk vuruş 1,5 sn'de.
ffmpeg -v error -y -i montaj/ara/01.mp4 -i montaj/ara/02.mp4 -i montaj/ara/03.mp4 -i montaj/ara/04.mp4 -i montaj/ara/05a.mp4 -i montaj/ara/05b.mp4 -i montaj/ara/06.mp4 -i montaj/ara/kart.mp4 \
  -ss 13.8 -i montaj/muzik.mp3 \
  -filter_complex "[0][1][2][3][4][5][6]concat=n=7:v=1:a=0,fps=24,settb=AVTB,format=yuv420p[body];[7]fps=24,settb=AVTB,format=yuv420p[card];[body][card]xfade=transition=fade:duration=0.5:offset=17.0,noise=c0s=4:c0f=t+u,format=yuv420p[v];[8]atrim=0:19,asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st=18.0:d=1.0[a]" \
  -map "[v]" -map "[a]" -frames:v 456 -r 24 -c:v libx264 -profile:v high -crf 16 -preset slow -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -movflags +faststart \
  montaj/cikti/reels-3.mp4
echo TAMAM
