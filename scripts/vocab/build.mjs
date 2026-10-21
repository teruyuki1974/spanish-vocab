import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { customs } from "./customs.mjs";
import { numberPhrases } from "./data/final.mjs";
import { phrases } from "./data/more.mjs";
import { groups } from "./groups.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const locked = [
  "tiempo",
  "casa",
  "agua",
  "amigo",
  "trabajo",
  "comida",
  "ciudad",
  "libro",
  "mañana",
  "noche",
  "familia",
  "escuela",
  "niño",
  "dinero",
  "puerta",
  "calle",
  "pregunta",
  "respuesta",
  "viaje",
  "idea",
  "problema",
  "ayuda",
  "nombre",
  "año",
];
const fromFile = JSON.parse(readFileSync(join(root, "src/data/words.json"), "utf8"));
const existing = fromFile.slice(0, locked.length);
if (existing.some((word, index) => word.spanish !== locked[index])) {
  throw new Error("先頭24語が元の見本と違います");
}

function fill(template) {
  return (value) => template.replaceAll("{{ja}}", value);
}

const elObj = [
  [(w) => `¿Dónde está el ${w}?`, (ja) => `その${ja}はどこですか？`],
  [(w) => `Necesito el ${w} ahora.`, (ja) => `今、その${ja}が必要です。`],
  [(w) => `El ${w} está aquí.`, (ja) => `その${ja}はここにあります。`],
  [(w) => `No encuentro el ${w}.`, (ja) => `その${ja}が見つかりません。`],
  [(w) => `Ayer compré el ${w}.`, (ja) => `昨日、その${ja}を買いました。`],
  [(w) => `Me gusta el ${w}.`, (ja) => `その${ja}が好きです。`],
  [(w) => `El ${w} es nuevo.`, (ja) => `その${ja}は新しいです。`],
  [(w) => `Guardé el ${w} en casa.`, (ja) => `その${ja}を家にしまいました。`],
  [(w) => `¿Has visto el ${w}?`, (ja) => `その${ja}を見ましたか？`],
  [(w) => `Voy a usar el ${w}.`, (ja) => `その${ja}を使うつもりです。`],
  [(w) => `El ${w} es de mi hermano.`, (ja) => `その${ja}は兄のものです。`],
  [(w) => `Este es el ${w} de Ana.`, (ja) => `これはアナの${ja}です。`],
  [(w) => `El ${w} cuesta poco.`, (ja) => `その${ja}はあまり高くありません。`],
  [(w) => `El ${w} ocupa su sitio.`, (ja) => `その${ja}はいつもの場所にあります。`],
  [(w) => `Quiero ver el ${w}.`, (ja) => `その${ja}が見たいです。`],
  [(w) => `El ${w} es importante para mí.`, (ja) => `その${ja}は私にとって大事です。`],
  [(w) => `El ${w} funciona bien.`, (ja) => `その${ja}は問題なく使えます。`],
  [(w) => `Busco el ${w} desde ayer.`, (ja) => `昨日からその${ja}を探しています。`],
  [(w) => `El ${w} sigue en su sitio.`, (ja) => `その${ja}は元の場所にあります。`],
  [(w) => `Cambiamos el ${w} el mes pasado.`, (ja) => `先月、その${ja}を替えました。`],
  [(w) => `El ${w} llegó hoy.`, (ja) => `その${ja}は今日届きました。`],
  [(w) => `Cuidado con el ${w}.`, (ja) => `その${ja}に気をつけてください。`],
  [(w) => `Hablamos del ${w} en casa.`, (ja) => `家でその${ja}の話をしました。`],
  [(w) => `Moví el ${w} un poco.`, (ja) => `その${ja}を少し動かしました。`],
];

const laObj = [
  [(w) => `¿Dónde está la ${w}?`, (ja) => `その${ja}はどこですか？`],
  [(w) => `Necesito la ${w} ahora.`, (ja) => `今、その${ja}が必要です。`],
  [(w) => `La ${w} está aquí.`, (ja) => `その${ja}はここにあります。`],
  [(w) => `No encuentro la ${w}.`, (ja) => `その${ja}が見つかりません。`],
  [(w) => `Ayer compré la ${w}.`, (ja) => `昨日、その${ja}を買いました。`],
  [(w) => `Me gusta la ${w}.`, (ja) => `その${ja}が好きです。`],
  [(w) => `La ${w} es nueva.`, (ja) => `その${ja}は新しいです。`],
  [(w) => `Guardé la ${w} en casa.`, (ja) => `その${ja}を家にしまいました。`],
  [(w) => `¿Has visto la ${w}?`, (ja) => `その${ja}を見ましたか？`],
  [(w) => `Voy a usar la ${w}.`, (ja) => `その${ja}を使うつもりです。`],
  [(w) => `La ${w} es de mi hermana.`, (ja) => `その${ja}は姉のものです。`],
  [(w) => `Esta es la ${w} de Ana.`, (ja) => `これはアナの${ja}です。`],
  [(w) => `La ${w} cuesta poco.`, (ja) => `その${ja}はあまり高くありません。`],
  [(w) => `La ${w} ocupa su sitio.`, (ja) => `その${ja}はいつもの場所にあります。`],
  [(w) => `Quiero ver la ${w}.`, (ja) => `その${ja}が見たいです。`],
  [(w) => `La ${w} es importante para mí.`, (ja) => `その${ja}は私にとって大事です。`],
  [(w) => `La ${w} funciona bien.`, (ja) => `その${ja}は問題なく使えます。`],
  [(w) => `Busco la ${w} desde ayer.`, (ja) => `昨日からその${ja}を探しています。`],
  [(w) => `La ${w} sigue en su sitio.`, (ja) => `その${ja}は元の場所にあります。`],
  [(w) => `Cambiamos la ${w} el mes pasado.`, (ja) => `先月、その${ja}を替えました。`],
  [(w) => `La ${w} llegó hoy.`, (ja) => `その${ja}は今日届きました。`],
  [(w) => `Cuidado con la ${w}.`, (ja) => `その${ja}に気をつけてください。`],
  [(w) => `Hablamos de la ${w} en casa.`, (ja) => `家でその${ja}の話をしました。`],
  [(w) => `Moví la ${w} un poco.`, (ja) => `その${ja}を少し動かしました。`],
];

const elPlace = [
  [(w) => `El ${w} está cerca.`, (ja) => `その${ja}は近いです。`],
  [(w) => `Vamos al ${w} esta tarde.`, (ja) => `今日の午後、${ja}へ行きます。`],
  [(w) => `Quedamos en el ${w}.`, (ja) => `${ja}で会いましょう。`],
  [(w) => `Conozco bien el ${w}.`, (ja) => `その${ja}をよく知っています。`],
  [(w) => `Me gusta el ${w}.`, (ja) => `その${ja}が好きです。`],
  [(w) => `Paso por el ${w} cada día.`, (ja) => `毎日その${ja}を通ります。`],
  [(w) => `El ${w} queda lejos.`, (ja) => `その${ja}は遠いです。`],
  [(w) => `Trabajo cerca del ${w}.`, (ja) => `その${ja}の近くで働いています。`],
  [(w) => `Hay poca gente en el ${w}.`, (ja) => `その${ja}には人が少ないです。`],
  [(w) => `Volvemos al ${w} mañana.`, (ja) => `明日、${ja}に戻ります。`],
  [(w) => `El ${w} es fácil de encontrar.`, (ja) => `その${ja}は見つけやすいです。`],
  [(w) => `¿Cómo llego al ${w}?`, (ja) => `${ja}へはどう行けばいいですか？`],
  [(w) => `El ${w} está al lado del banco.`, (ja) => `その${ja}は銀行の隣です。`],
  [(w) => `Ayer estuve en el ${w}.`, (ja) => `昨日、その${ja}にいました。`],
  [(w) => `El ${w} es tranquilo por la mañana.`, (ja) => `午前中の${ja}は静かです。`],
  [(w) => `Nos perdimos cerca del ${w}.`, (ja) => `${ja}の近くで道に迷いました。`],
];

const laPlace = [
  [(w) => `La ${w} está cerca.`, (ja) => `その${ja}は近いです。`],
  [(w) => `Vamos a la ${w} esta tarde.`, (ja) => `今日の午後、${ja}へ行きます。`],
  [(w) => `Quedamos en la ${w}.`, (ja) => `${ja}で会いましょう。`],
  [(w) => `Conozco bien la ${w}.`, (ja) => `その${ja}をよく知っています。`],
  [(w) => `Me gusta la ${w}.`, (ja) => `その${ja}が好きです。`],
  [(w) => `Paso por la ${w} cada día.`, (ja) => `毎日その${ja}を通ります。`],
  [(w) => `La ${w} queda lejos.`, (ja) => `その${ja}は遠いです。`],
  [(w) => `Trabajo cerca de la ${w}.`, (ja) => `その${ja}の近くで働いています。`],
  [(w) => `Hay poca gente en la ${w}.`, (ja) => `その${ja}には人が少ないです。`],
  [(w) => `Volvemos a la ${w} mañana.`, (ja) => `明日、${ja}に戻ります。`],
  [(w) => `La ${w} es fácil de encontrar.`, (ja) => `その${ja}は見つけやすいです。`],
  [(w) => `¿Cómo llego a la ${w}?`, (ja) => `${ja}へはどう行けばいいですか？`],
  [(w) => `La ${w} está al lado del banco.`, (ja) => `その${ja}は銀行の隣です。`],
  [(w) => `Ayer estuve en la ${w}.`, (ja) => `昨日、その${ja}にいました。`],
  [(w) => `La ${w} es tranquila por la mañana.`, (ja) => `午前中の${ja}は静かです。`],
  [(w) => `Nos perdimos cerca de la ${w}.`, (ja) => `${ja}の近くで道に迷いました。`],
];

const elPerson = [
  [(w) => `El ${w} llega mañana.`, (ja) => `その${ja}は明日来ます。`],
  [(w) => `Hablé con el ${w}.`, (ja) => `その${ja}と話しました。`],
  [(w) => `El ${w} trabaja aquí.`, (ja) => `その${ja}はここで働いています。`],
  [(w) => `Conozco al ${w}.`, (ja) => `その${ja}を知っています。`],
  [(w) => `El ${w} es amable.`, (ja) => `その${ja}は感じがいいです。`],
  [(w) => `Llamé al ${w} por la tarde.`, (ja) => `午後、その${ja}に電話しました。`],
  [(w) => `El ${w} vive cerca.`, (ja) => `その${ja}は近くに住んでいます。`],
  [(w) => `Confío en el ${w}.`, (ja) => `その${ja}を信頼しています。`],
  [(w) => `El ${w} nos ayudó mucho.`, (ja) => `その${ja}は私たちをよく助けてくれました。`],
  [(w) => `Esperamos al ${w} en la entrada.`, (ja) => `入口でその${ja}を待ちます。`],
  [(w) => `El ${w} explica las cosas con calma.`, (ja) => `その${ja}は落ち着いて説明します。`],
  [(w) => `Ayer vi al ${w} en el centro.`, (ja) => `昨日、街の中心でその${ja}を見ました。`],
  [(w) => `El ${w} empieza temprano.`, (ja) => `その${ja}は早く仕事を始めます。`],
  [(w) => `Pregunté al ${w} y me contestó.`, (ja) => `その${ja}に聞くと、答えてくれました。`],
  [(w) => `El ${w} conoce bien el barrio.`, (ja) => `その${ja}はこの地区をよく知っています。`],
  [(w) => `Quedé con el ${w} a las seis.`, (ja) => `6時にその${ja}と会う約束をしました。`],
];

const laPerson = [
  [(w) => `La ${w} llega mañana.`, (ja) => `その${ja}は明日来ます。`],
  [(w) => `Hablé con la ${w}.`, (ja) => `その${ja}と話しました。`],
  [(w) => `La ${w} trabaja aquí.`, (ja) => `その${ja}はここで働いています。`],
  [(w) => `Conozco a la ${w}.`, (ja) => `その${ja}を知っています。`],
  [(w) => `La ${w} es amable.`, (ja) => `その${ja}は感じがいいです。`],
  [(w) => `Llamé a la ${w} por la tarde.`, (ja) => `午後、その${ja}に電話しました。`],
  [(w) => `La ${w} vive cerca.`, (ja) => `その${ja}は近くに住んでいます。`],
  [(w) => `Confío en la ${w}.`, (ja) => `その${ja}を信頼しています。`],
  [(w) => `La ${w} nos ayudó mucho.`, (ja) => `その${ja}は私たちをよく助けてくれました。`],
  [(w) => `Esperamos a la ${w} en la entrada.`, (ja) => `入口でその${ja}を待ちます。`],
  [(w) => `La ${w} explica las cosas con calma.`, (ja) => `その${ja}は落ち着いて説明します。`],
  [(w) => `Ayer vi a la ${w} en el centro.`, (ja) => `昨日、街の中心でその${ja}を見ました。`],
  [(w) => `La ${w} empieza temprano.`, (ja) => `その${ja}は早く仕事を始めます。`],
  [(w) => `Pregunté a la ${w} y me contestó.`, (ja) => `その${ja}に聞くと、答えてくれました。`],
  [(w) => `La ${w} conoce bien el barrio.`, (ja) => `その${ja}はこの地区をよく知っています。`],
  [(w) => `Quedé con la ${w} a las seis.`, (ja) => `6時にその${ja}と会う約束をしました。`],
];

const elFood = [
  [(w) => `El ${w} está rico.`, (ja) => `この${ja}はおいしいです。`],
  [(w) => `Quiero ${w} para cenar.`, (ja) => `夕食に${ja}が欲しいです。`],
  [(w) => `Compré ${w} en el mercado.`, (ja) => `市場で${ja}を買いました。`],
  [(w) => `Hoy como ${w}.`, (ja) => `今日は${ja}を食べます。`],
  [(w) => `Me gusta el ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `No queda ${w}.`, (ja) => `${ja}が残っていません。`],
  [(w) => `El ${w} está en la mesa.`, (ja) => `${ja}はテーブルの上です。`],
  [(w) => `Falta ${w} para la cena.`, (ja) => `夕食の${ja}が足りません。`],
  [(w) => `Prueba el ${w}, está bueno.`, (ja) => `${ja}を食べてみて。おいしいです。`],
  [(w) => `Guardé el ${w} en la nevera.`, (ja) => `${ja}を冷蔵庫にしまいました。`],
  [(w) => `El ${w} de ayer todavía sirve.`, (ja) => `昨日の${ja}はまだ食べられます。`],
  [(w) => `Pon el ${w} en el plato.`, (ja) => `${ja}を皿に置いてください。`],
  [(w) => `Este ${w} sabe raro.`, (ja) => `この${ja}は味が変です。`],
  [(w) => `Comparto el ${w} contigo.`, (ja) => `${ja}を分けます。`],
  [(w) => `El ${w} se acabó esta mañana.`, (ja) => `${ja}は今朝なくなりました。`],
  [(w) => `Traje ${w} de la tienda.`, (ja) => `店から${ja}を持ってきました。`],
];

const laFood = [
  [(w) => `La ${w} está rica.`, (ja) => `この${ja}はおいしいです。`],
  [(w) => `Quiero ${w} para cenar.`, (ja) => `夕食に${ja}が欲しいです。`],
  [(w) => `Compré ${w} en el mercado.`, (ja) => `市場で${ja}を買いました。`],
  [(w) => `Hoy como ${w}.`, (ja) => `今日は${ja}を食べます。`],
  [(w) => `Me gusta la ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `No queda ${w}.`, (ja) => `${ja}が残っていません。`],
  [(w) => `La ${w} está en la mesa.`, (ja) => `${ja}はテーブルの上です。`],
  [(w) => `Falta ${w} para la cena.`, (ja) => `夕食の${ja}が足りません。`],
  [(w) => `Prueba la ${w}, está buena.`, (ja) => `${ja}を食べてみて。おいしいです。`],
  [(w) => `Guardé la ${w} en la nevera.`, (ja) => `${ja}を冷蔵庫にしまいました。`],
  [(w) => `La ${w} de ayer todavía sirve.`, (ja) => `昨日の${ja}はまだ食べられます。`],
  [(w) => `Pon la ${w} en el plato.`, (ja) => `${ja}を皿に置いてください。`],
  [(w) => `Esta ${w} sabe rara.`, (ja) => `この${ja}は味が変です。`],
  [(w) => `Comparto la ${w} contigo.`, (ja) => `${ja}を分けます。`],
  [(w) => `La ${w} se acabó esta mañana.`, (ja) => `${ja}は今朝なくなりました。`],
  [(w) => `Traje ${w} de la tienda.`, (ja) => `店から${ja}を持ってきました。`],
];

const elBody = [
  [(w) => `Me duele el ${w}.`, (ja) => `${ja}が痛いです。`],
  [(w) => `Tengo el ${w} hinchado.`, (ja) => `${ja}が腫れています。`],
  [(w) => `Me curé el ${w} ayer.`, (ja) => `昨日、${ja}の手当てをしました。`],
  [(w) => `Noté algo en el ${w}.`, (ja) => `${ja}に何か違和感があります。`],
  [(w) => `Moví el ${w} con cuidado.`, (ja) => `${ja}をそっと動かしました。`],
  [(w) => `El médico miró el ${w}.`, (ja) => `医者が${ja}を見ました。`],
  [(w) => `El ${w} me molesta hoy.`, (ja) => `今日は${ja}が気になります。`],
  [(w) => `El ${w} está mejor hoy.`, (ja) => `今日は${ja}の具合がいいです。`],
  [(w) => `No puedo mover el ${w}.`, (ja) => `${ja}を動かせません。`],
  [(w) => `Cuido el ${w}.`, (ja) => `${ja}をいたわるようにしています。`],
  [(w) => `El ${w} dejó de doler.`, (ja) => `${ja}の痛みが止まりました。`],
  [(w) => `El médico revisó el ${w}.`, (ja) => `医者が${ja}を診ました。`],
];

const laBody = [
  [(w) => `Me duele la ${w}.`, (ja) => `${ja}が痛いです。`],
  [(w) => `Tengo la ${w} hinchada.`, (ja) => `${ja}が腫れています。`],
  [(w) => `Me curé la ${w} ayer.`, (ja) => `昨日、${ja}の手当てをしました。`],
  [(w) => `Noté algo en la ${w}.`, (ja) => `${ja}に何か違和感があります。`],
  [(w) => `Moví la ${w} con cuidado.`, (ja) => `${ja}をそっと動かしました。`],
  [(w) => `El médico miró la ${w}.`, (ja) => `医者が${ja}を見ました。`],
  [(w) => `La ${w} me molesta hoy.`, (ja) => `今日は${ja}が気になります。`],
  [(w) => `La ${w} está mejor hoy.`, (ja) => `今日は${ja}の具合がいいです。`],
  [(w) => `No puedo mover la ${w}.`, (ja) => `${ja}を動かせません。`],
  [(w) => `Cuido la ${w}.`, (ja) => `${ja}をいたわるようにしています。`],
  [(w) => `La ${w} dejó de doler.`, (ja) => `${ja}の痛みが止まりました。`],
  [(w) => `El médico revisó la ${w}.`, (ja) => `医者が${ja}を診ました。`],
];

const elAbs = [
  [(w) => `El ${w} cambió mucho.`, (ja) => `${ja}は大きく変わりました。`],
  [(w) => `Hablamos del ${w} con calma.`, (ja) => `${ja}について落ち着いて話しました。`],
  [(w) => `No entiendo el ${w}.`, (ja) => `${ja}がわかりません。`],
  [(w) => `El ${w} es importante.`, (ja) => `${ja}は大事です。`],
  [(w) => `Ese ${w} me preocupa.`, (ja) => `その${ja}が気になります。`],
  [(w) => `El ${w} llegó sin avisar.`, (ja) => `${ja}は突然やって来ました。`],
  [(w) => `Acepto el ${w} como es.`, (ja) => `その${ja}をそのまま受け入れます。`],
  [(w) => `El ${w} depende de ti.`, (ja) => `${ja}はあなた次第です。`],
  [(w) => `Explicó el ${w} con un ejemplo.`, (ja) => `例を挙げて${ja}を説明しました。`],
  [(w) => `El ${w} mejoró esta semana.`, (ja) => `今週、${ja}はよくなりました。`],
  [(w) => `Dudé del ${w} al principio.`, (ja) => `最初はその${ja}を疑いました。`],
  [(w) => `El ${w} nos afecta a todos.`, (ja) => `その${ja}はみんなに影響します。`],
  [(w) => `Recuerdo el ${w} con claridad.`, (ja) => `その${ja}をはっきり覚えています。`],
  [(w) => `El ${w} no tiene solución fácil.`, (ja) => `その${ja}に簡単な解決はありません。`],
  [(w) => `Confío en el ${w}.`, (ja) => `その${ja}を信じています。`],
  [(w) => `El ${w} empezó el lunes.`, (ja) => `その${ja}は月曜日に始まりました。`],
];

const laAbs = [
  [(w) => `La ${w} cambió mucho.`, (ja) => `${ja}は大きく変わりました。`],
  [(w) => `Hablamos de la ${w} con calma.`, (ja) => `${ja}について落ち着いて話しました。`],
  [(w) => `No entiendo la ${w}.`, (ja) => `${ja}がわかりません。`],
  [(w) => `La ${w} es importante.`, (ja) => `${ja}は大事です。`],
  [(w) => `Esa ${w} me preocupa.`, (ja) => `その${ja}が気になります。`],
  [(w) => `La ${w} llegó sin avisar.`, (ja) => `${ja}は突然やって来ました。`],
  [(w) => `Acepto la ${w} como es.`, (ja) => `その${ja}をそのまま受け入れます。`],
  [(w) => `La ${w} depende de ti.`, (ja) => `${ja}はあなた次第です。`],
  [(w) => `Explicó la ${w} con un ejemplo.`, (ja) => `例を挙げて${ja}を説明しました。`],
  [(w) => `La ${w} mejoró esta semana.`, (ja) => `今週、${ja}はよくなりました。`],
  [(w) => `Dudé de la ${w} al principio.`, (ja) => `最初はその${ja}を疑いました。`],
  [(w) => `La ${w} nos afecta a todos.`, (ja) => `その${ja}はみんなに影響します。`],
  [(w) => `Recuerdo la ${w} con claridad.`, (ja) => `その${ja}をはっきり覚えています。`],
  [(w) => `La ${w} no tiene solución fácil.`, (ja) => `その${ja}に簡単な解決はありません。`],
  [(w) => `Confío en la ${w}.`, (ja) => `その${ja}を信じています。`],
  [(w) => `La ${w} empezó el lunes.`, (ja) => `その${ja}は月曜日に始まりました。`],
];

const elRide = [
  [(w) => `Hoy cojo el ${w}.`, (ja) => `今日は${ja}に乗ります。`],
  [(w) => `El ${w} llega tarde.`, (ja) => `${ja}は遅れています。`],
  [(w) => `Espero el ${w} en la parada.`, (ja) => `停留所で${ja}を待っています。`],
  [(w) => `El ${w} va lleno.`, (ja) => `${ja}は混んでいます。`],
  [(w) => `Bajo del ${w} aquí.`, (ja) => `ここで${ja}を降ります。`],
  [(w) => `El ${w} sale pronto.`, (ja) => `${ja}はすぐに出ます。`],
  [(w) => `Me subo al ${w}.`, (ja) => `${ja}に乗り込みます。`],
  [(w) => `El ${w} es más rápido.`, (ja) => `${ja}の方が速いです。`],
  [(w) => `¿Dónde para el ${w}?`, (ja) => `${ja}はどこに止まりますか？`],
  [(w) => `Perdí el ${w} de las ocho.`, (ja) => `8時の${ja}に乗り遅れた。`],
  [(w) => `El ${w} para en esta esquina.`, (ja) => `${ja}はこの角に止まります。`],
  [(w) => `Hay otro ${w} en diez minutos.`, (ja) => `別の${ja}が10分後に来ます。`],
];

const elCloth = [
  [(w) => `Hoy llevo el ${w}.`, (ja) => `今日は${ja}を着ています。`],
  [(w) => `El ${w} está limpio.`, (ja) => `${ja}はきれいです。`],
  [(w) => `¿Dónde dejé el ${w}?`, (ja) => `${ja}をどこに置いたかな。`],
  [(w) => `El ${w} me queda bien.`, (ja) => `${ja}はサイズが合います。`],
  [(w) => `Ayer lavé el ${w}.`, (ja) => `昨日、${ja}を洗いました。`],
  [(w) => `El ${w} es cómodo.`, (ja) => `${ja}は着心地がいいです。`],
  [(w) => `Compré el ${w} ayer.`, (ja) => `昨日、${ja}を買いました。`],
  [(w) => `Olvidé el ${w} en casa.`, (ja) => `${ja}を家に置いてきました。`],
  [(w) => `Guardé el ${w} en el armario.`, (ja) => `${ja}をクローゼットにしまいました。`],
  [(w) => `Me pruebo el ${w}.`, (ja) => `${ja}を試着します。`],
  [(w) => `El ${w} me aprieta un poco.`, (ja) => `${ja}が少しきついです。`],
  [(w) => `Busco el ${w}.`, (ja) => `${ja}を探しています。`],
  [(w) => `Regalé el ${w}.`, (ja) => `${ja}をプレゼントしました。`],
  [(w) => `El ${w} se secó al sol.`, (ja) => `${ja}は日に干して乾きました。`],
  [(w) => `Me pongo el ${w}.`, (ja) => `${ja}を身につけます。`],
  [(w) => `El ${w} está en la silla.`, (ja) => `${ja}は椅子の上です。`],
  [(w) => `Me gusta el ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `El ${w} es nuevo.`, (ja) => `${ja}は新しいです。`],
  [(w) => `Perdí el ${w}.`, (ja) => `${ja}をなくしました。`],
  [(w) => `El ${w} está mojado.`, (ja) => `${ja}が濡れています。`],
];

const laCloth = [
  [(w) => `Hoy llevo la ${w}.`, (ja) => `今日は${ja}を着ています。`],
  [(w) => `La ${w} está limpia.`, (ja) => `${ja}はきれいです。`],
  [(w) => `¿Dónde dejé la ${w}?`, (ja) => `${ja}をどこに置いたかな。`],
  [(w) => `La ${w} me queda bien.`, (ja) => `${ja}はサイズが合います。`],
  [(w) => `Ayer lavé la ${w}.`, (ja) => `昨日、${ja}を洗いました。`],
  [(w) => `La ${w} es cómoda.`, (ja) => `${ja}は着心地がいいです。`],
  [(w) => `Compré la ${w} ayer.`, (ja) => `昨日、${ja}を買いました。`],
  [(w) => `Olvidé la ${w} en casa.`, (ja) => `${ja}を家に置いてきました。`],
  [(w) => `Guardé la ${w} en el armario.`, (ja) => `${ja}をクローゼットにしまいました。`],
  [(w) => `Me pruebo la ${w}.`, (ja) => `${ja}を試着します。`],
  [(w) => `La ${w} me aprieta un poco.`, (ja) => `${ja}が少しきついです。`],
  [(w) => `Busco la ${w}.`, (ja) => `${ja}を探しています。`],
  [(w) => `Regalé la ${w}.`, (ja) => `${ja}をプレゼントしました。`],
  [(w) => `La ${w} se secó al sol.`, (ja) => `${ja}は日に干して乾きました。`],
  [(w) => `Me pongo la ${w}.`, (ja) => `${ja}を身につけます。`],
  [(w) => `La ${w} está en la silla.`, (ja) => `${ja}は椅子の上です。`],
  [(w) => `Me gusta la ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `La ${w} es nueva.`, (ja) => `${ja}は新しいです。`],
  [(w) => `Perdí la ${w}.`, (ja) => `${ja}をなくしました。`],
  [(w) => `La ${w} está mojada.`, (ja) => `${ja}が濡れています。`],
];

const elAnimal = [
  [(w) => `Vi un ${w}.`, (ja) => `${ja}を見ました。`],
  [(w) => `El ${w} duerme.`, (ja) => `${ja}は眠っています。`],
  [(w) => `Me gusta el ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `El ${w} come despacio.`, (ja) => `${ja}はゆっくり食べます。`],
  [(w) => `El ${w} bebe agua.`, (ja) => `${ja}は水を飲みます。`],
  [(w) => `Ese ${w} es tranquilo.`, (ja) => `その${ja}はおとなしいです。`],
  [(w) => `El ${w} busca comida.`, (ja) => `${ja}は餌を探しています。`],
  [(w) => `Ayer vimos un ${w}.`, (ja) => `昨日、${ja}を見ました。`],
  [(w) => `El ${w} descansa.`, (ja) => `${ja}は休んでいます。`],
  [(w) => `El niño mira el ${w}.`, (ja) => `男の子が${ja}を見ています。`],
  [(w) => `El ${w} se mueve.`, (ja) => `${ja}が動きます。`],
  [(w) => `El ${w} hace un ruido.`, (ja) => `${ja}が音を立てます。`],
  [(w) => `El ${w} tiene hambre.`, (ja) => `${ja}はお腹が空いています。`],
  [(w) => `No toques el ${w}.`, (ja) => `${ja}に触らないでください。`],
  [(w) => `El ${w} está cerca.`, (ja) => `${ja}は近くにいます。`],
  [(w) => `En el libro sale un ${w}.`, (ja) => `本に${ja}が出てきます。`],
  [(w) => `El ${w} nos mira.`, (ja) => `${ja}がこちらを見ています。`],
  [(w) => `Escucho al ${w}.`, (ja) => `${ja}の声が聞こえます。`],
];

const laAnimal = [
  [(w) => `Vi una ${w}.`, (ja) => `${ja}を見ました。`],
  [(w) => `La ${w} duerme.`, (ja) => `${ja}は眠っています。`],
  [(w) => `Me gusta la ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `La ${w} come despacio.`, (ja) => `${ja}はゆっくり食べます。`],
  [(w) => `La ${w} bebe agua.`, (ja) => `${ja}は水を飲みます。`],
  [(w) => `Esa ${w} es tranquila.`, (ja) => `その${ja}はおとなしいです。`],
  [(w) => `La ${w} busca comida.`, (ja) => `${ja}は餌を探しています。`],
  [(w) => `Ayer vimos una ${w}.`, (ja) => `昨日、${ja}を見ました。`],
  [(w) => `La ${w} descansa.`, (ja) => `${ja}は休んでいます。`],
  [(w) => `El niño mira la ${w}.`, (ja) => `男の子が${ja}を見ています。`],
  [(w) => `La ${w} se mueve.`, (ja) => `${ja}が動きます。`],
  [(w) => `La ${w} hace un ruido.`, (ja) => `${ja}が音を立てます。`],
  [(w) => `La ${w} tiene hambre.`, (ja) => `${ja}はお腹が空いています。`],
  [(w) => `No toques la ${w}.`, (ja) => `${ja}に触らないでください。`],
  [(w) => `La ${w} está cerca.`, (ja) => `${ja}は近くにいます。`],
  [(w) => `En el libro sale una ${w}.`, (ja) => `本に${ja}が出てきます。`],
  [(w) => `La ${w} nos mira.`, (ja) => `${ja}がこちらを見ています。`],
  [(w) => `Escucho a la ${w}.`, (ja) => `${ja}の声が聞こえます。`],
];

const elNature = [
  [(w) => `Desde aquí se ve el ${w}.`, (ja) => `ここから${ja}が見えます。`],
  [(w) => `Me gusta el ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `Ayer pasamos junto al ${w}.`, (ja) => `昨日、${ja}のそばを通りました。`],
  [(w) => `El ${w} queda lejos.`, (ja) => `${ja}は遠いです。`],
  [(w) => `El ${w} es grande.`, (ja) => `${ja}は大きいです。`],
  [(w) => `El ${w} está en calma.`, (ja) => `${ja}は穏やかです。`],
  [(w) => `Conocemos el ${w}.`, (ja) => `${ja}を知っています。`],
  [(w) => `Hablamos del ${w}.`, (ja) => `${ja}の話をしました。`],
  [(w) => `El ${w} se ve bonito hoy.`, (ja) => `今日の${ja}はきれいです。`],
  [(w) => `Llegamos al ${w} por la tarde.`, (ja) => `午後に${ja}へ着きました。`],
  [(w) => `Fotografiamos el ${w}.`, (ja) => `${ja}を写真に撮りました。`],
  [(w) => `Caminamos hacia el ${w}.`, (ja) => `${ja}に向かって歩きました。`],
  [(w) => `El ${w} aparece en el mapa.`, (ja) => `${ja}は地図に載っています。`],
  [(w) => `Volveremos al ${w}.`, (ja) => `${ja}にまた来ます。`],
  [(w) => `El ${w} impresiona.`, (ja) => `${ja}は印象に残ります。`],
  [(w) => `El ${w} cambia con las estaciones.`, (ja) => `${ja}は季節で変わります。`],
];

const laNature = [
  [(w) => `Desde aquí se ve la ${w}.`, (ja) => `ここから${ja}が見えます。`],
  [(w) => `Me gusta la ${w}.`, (ja) => `${ja}が好きです。`],
  [(w) => `Ayer pasamos junto a la ${w}.`, (ja) => `昨日、${ja}のそばを通りました。`],
  [(w) => `La ${w} queda lejos.`, (ja) => `${ja}は遠いです。`],
  [(w) => `La ${w} es grande.`, (ja) => `${ja}は大きいです。`],
  [(w) => `La ${w} está en calma.`, (ja) => `${ja}は穏やかです。`],
  [(w) => `Conocemos la ${w}.`, (ja) => `${ja}を知っています。`],
  [(w) => `Hablamos de la ${w}.`, (ja) => `${ja}の話をしました。`],
  [(w) => `La ${w} se ve bonita hoy.`, (ja) => `今日の${ja}はきれいです。`],
  [(w) => `Llegamos a la ${w} por la tarde.`, (ja) => `午後に${ja}へ着きました。`],
  [(w) => `Fotografiamos la ${w}.`, (ja) => `${ja}を写真に撮りました。`],
  [(w) => `Caminamos hacia la ${w}.`, (ja) => `${ja}に向かって歩きました。`],
  [(w) => `La ${w} aparece en el mapa.`, (ja) => `${ja}は地図に載っています。`],
  [(w) => `Volveremos a la ${w}.`, (ja) => `${ja}にまた来ます。`],
  [(w) => `La ${w} impresiona.`, (ja) => `${ja}は印象に残ります。`],
  [(w) => `La ${w} cambia con las estaciones.`, (ja) => `${ja}は季節で変わります。`],
];

const verbs = [
  [(w) => `Hoy quiero ${w}.`, fill("今日は{{ja}}つもりです。")],
  [(w) => `Mañana voy a ${w}.`, fill("明日{{ja}}予定です。")],
  [(w) => `Me gusta ${w}.`, fill("{{ja}}のが好きです。")],
  [(w) => `Es difícil ${w} así.`, fill("そのように{{ja}}のは難しいです。")],
  [(w) => `Aprendí a ${w} el año pasado.`, fill("去年、{{ja}}のを覚えました。")],
  [(w) => `Hay que ${w} con cuidado.`, fill("気をつけて{{ja}}必要があります。")],
  [(w) => `Vale la pena ${w}.`, fill("{{ja}}価値があります。")],
  [(w) => `Ayer empecé a ${w}.`, fill("昨日、{{ja}}のを始めました。")],
  [(w) => `Prefiero ${w} en casa.`, fill("家で{{ja}}方がいいです。")],
  [(w) => `No sé ${w} todavía.`, fill("まだ{{ja}}のがわかりません。")],
  [(w) => `Dejé de ${w} el mes pasado.`, fill("先月、{{ja}}のをやめました。")],
  [(w) => `Es importante ${w} cada día.`, fill("毎日{{ja}}ことが大切です。")],
  [(w) => `Me cuesta ${w} por la mañana.`, fill("朝に{{ja}}のが苦手です。")],
  [(w) => `Luego pienso ${w}.`, fill("あとで{{ja}}つもりです。")],
  [(w) => `Olvidé ${w} ayer.`, fill("昨日、{{ja}}のを忘れました。")],
  [(w) => `Ya terminé de ${w}.`, fill("もう{{ja}}のを終えました。")],
  [(w) => `¿Te gusta ${w}?`, fill("{{ja}}のは好きですか？")],
  [(w) => `Podemos ${w} juntos.`, fill("一緒に{{ja}}ことができます。")],
  [(w) => `Intenté ${w} otra vez.`, fill("もう一度{{ja}}のを試みました。")],
  [(w) => `No hace falta ${w} ahora.`, fill("今{{ja}}必要はありません。")],
  [(w) => `Prometí ${w} el viernes.`, fill("金曜日に{{ja}}と約束しました。")],
  [(w) => `Me pidió ${w}.`, fill("{{ja}}ように頼まれました。")],
  [(w) => `Antes de ${w}, llama.`, fill("{{ja}}前に電話してください。")],
  [(w) => `Cuando termine de ${w}, descanso.`, fill("{{ja}}のを終えたら休みます。")],
  [(w) => `Estoy aprendiendo a ${w}.`, fill("{{ja}}のを練習中です。")],
  [(w) => `No pienso ${w} hoy.`, fill("今日は{{ja}}つもりはありません。")],
  [(w) => `¿Sabes ${w}?`, fill("{{ja}}ことができますか？")],
  [(w) => `Conviene ${w} temprano.`, fill("早めに{{ja}}方がよいです。")],
  [(w) => `Volví a ${w} esta semana.`, fill("今週、もう一度{{ja}}ことにしました。")],
  [(w) => `Sigo sin ${w}.`, fill("まだ{{ja}}ことはありません。")],
  [(w) => `Tardé en ${w}.`, fill("{{ja}}のに時間がかかりました。")],
  [(w) => `Acabo de ${w}.`, fill("たった今{{ja}}のを済ませました。")],
  [(w) => `Ayúdame a ${w}.`, fill("{{ja}}のを手伝ってください。")],
  [(w) => `Quedó en ${w} conmigo.`, fill("私と{{ja}}約束をしました。")],
  [(w) => `Me enseñaron a ${w}.`, fill("{{ja}}のを教わりました。")],
  [(w) => `Prefiero no ${w}.`, fill("{{ja}}のは控えたいです。")],
];

const adjThing = [
  [(w) => `El resultado es ${w}.`, fill("結果は{{ja}}。")],
  [(w) => `El plan es ${w}.`, fill("その計画は{{ja}}。")],
  [(w) => `Esto me parece ${w}.`, fill("これは{{ja}}。")],
  [(w) => `No es ${w} del todo.`, fill("完全に{{ja}}というわけではありません。")],
  [(w) => `Lo veo ${w}.`, fill("それは{{ja}}と見ています。")],
  [(w) => `El precio es ${w}.`, fill("値段は{{ja}}。")],
  [(w) => `Para mí es ${w}.`, fill("私にとっては{{ja}}。")],
  [(w) => `El camino es ${w}.`, fill("その道は{{ja}}。")],
  [(w) => `El informe es ${w}.`, fill("その報告書は{{ja}}。")],
  [(w) => `Ese dato es ${w}.`, fill("その情報は{{ja}}。")],
  [(w) => `El cambio es ${w}.`, fill("その変化は{{ja}}。")],
  [(w) => `Al final quedó ${w}.`, fill("最後には{{ja}}。")],
  [(w) => `El tamaño es ${w}.`, fill("大きさは{{ja}}。")],
  [(w) => `El tono es ${w}.`, fill("印象は{{ja}}。")],
  [(w) => `En general es ${w}.`, fill("全体として{{ja}}。")],
  [(w) => `Comparado con eso, es ${w}.`, fill("それと比べると{{ja}}。")],
];

const adjFeel = [
  [(w) => `Hoy estoy ${w}.`, fill("今日は{{ja}}。")],
  [(w) => `Ayer también estaba ${w}.`, fill("昨日も{{ja}}。")],
  [(w) => `Desde esta mañana estoy ${w}.`, fill("今朝から{{ja}}。")],
  [(w) => `Últimamente ando ${w}.`, fill("このごろ{{ja}}。")],
  [(w) => `Ahora mismo estoy ${w}.`, fill("今ちょうど{{ja}}。")],
  [(w) => `Por la noche estoy ${w}.`, fill("夜は{{ja}}。")],
  [(w) => `En casa estoy ${w}.`, fill("家にいると{{ja}}。")],
  [(w) => `En el trabajo estoy ${w}.`, fill("仕事中は{{ja}}。")],
  [(w) => `Los fines de semana estoy ${w}.`, fill("週末は{{ja}}。")],
  [(w) => `Cuando me levanto estoy ${w}.`, fill("起きたときは{{ja}}。")],
  [(w) => `Al terminar el día estoy ${w}.`, fill("1日の終わりには{{ja}}。")],
  [(w) => `Con esta noticia estoy ${w}.`, fill("この知らせで{{ja}}。")],
];

const adjPerson = [
  [(w) => `Mi hermano es ${w}.`, fill("弟は{{ja}}。")],
  [(w) => `El nuevo vecino es ${w}.`, fill("新しい隣人は{{ja}}。")],
  [(w) => `De niño ya era ${w}.`, fill("子どものころから{{ja}}。")],
  [(w) => `En clase es ${w}.`, fill("授業中は{{ja}}。")],
  [(w) => `Con los amigos es ${w}.`, fill("友人の前では{{ja}}。")],
  [(w) => `Siempre ha sido ${w}.`, fill("昔から{{ja}}。")],
  [(w) => `En el trabajo es ${w}.`, fill("仕事では{{ja}}。")],
  [(w) => `En casa es ${w}.`, fill("家では{{ja}}。")],
  [(w) => `Mi padre es ${w}.`, fill("父は{{ja}}。")],
  [(w) => `Ese chico es ${w}.`, fill("あの青年は{{ja}}。")],
  [(w) => `El jefe es ${w}.`, fill("上司は{{ja}}。")],
  [(w) => `Un amigo mío es ${w}.`, fill("友人の一人は{{ja}}。")],
];

const advManner = [
  [(w) => `Hazlo ${w}, por favor.`, fill("{{ja}}やってください。")],
  [(w) => `Lo explicó ${w}.`, fill("{{ja}}説明しました。")],
  [(w) => `Habla ${w}.`, fill("{{ja}}話してください。")],
  [(w) => `Caminamos ${w} hasta casa.`, fill("家まで{{ja}}歩きました。")],
  [(w) => `Lo leí ${w} anoche.`, fill("昨夜、それを{{ja}}読みました。")],
  [(w) => `Escribe ${w}.`, fill("{{ja}}書いてください。")],
  [(w) => `Cerró la puerta ${w}.`, fill("ドアを{{ja}}閉めました。")],
  [(w) => `Trabajamos ${w} esta semana.`, fill("今週は{{ja}}働きました。")],
  [(w) => `Repite ${w} la frase.`, fill("その文を{{ja}}繰り返してください。")],
  [(w) => `Respondió ${w}.`, fill("{{ja}}答えました。")],
  [(w) => `Empezó ${w}.`, fill("{{ja}}始めました。")],
  [(w) => `Lo guardó ${w}.`, fill("それを{{ja}}しまいました。")],
];

const frames = {
  elObj,
  laObj,
  elPlace,
  laPlace,
  elPerson,
  laPerson,
  elFood,
  laFood,
  elBody,
  laBody,
  elAbs,
  laAbs,
  elRide,
  elCloth,
  laCloth,
  elAnimal,
  laAnimal,
  elNature,
  laNature,
  verbs,
  adjThing,
  adjFeel,
  adjPerson,
  advManner,
};

function hasWord(chunk, word) {
  if (word.includes(" ")) return chunk.toLowerCase().includes(word.toLowerCase());
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{M}])${escaped}(?![\\p{L}\\p{M}])`, "iu").test(chunk);
}

const seen = new Set(existing.map((word) => word.spanish.toLowerCase()));
const built = existing.map((word) => ({ ...word }));

function pushReady(spanish, japanese, chunk) {
  const key = spanish.toLowerCase();
  if (seen.has(key)) return false;
  if (!hasWord(chunk, spanish)) {
    throw new Error(`チャンクに単語がありません: ${spanish} / ${chunk}`);
  }
  seen.add(key);
  built.push({ spanish, japanese, chunk });
  return true;
}

for (const [spanish, japanese, chunk] of [...customs, ...phrases, ...numberPhrases]) {
  pushReady(spanish, japanese, chunk);
}

for (const [kind, pairs] of groups) {
  const bank = frames[kind];
  if (!bank) throw new Error(`未知の種類: ${kind}`);
  pairs.forEach((pair, index) => {
    const [spanish, japanese] = pair;
    if (seen.has(spanish.toLowerCase())) return;
    const [toChunk, toJapanese] = bank[(index * 5 + kind.length) % bank.length];
    const chunk = toChunk(spanish, japanese);
    const line = typeof toJapanese === "function" ? toJapanese(japanese) : toJapanese.replaceAll("{{ja}}", japanese);
    if (/\{\{ja\}\}|\$\{ja\}|undefined|ですです|ますます/.test(line)) {
      throw new Error(`訳が壊れています: ${spanish} / ${line}`);
    }
    pushReady(spanish, line, chunk);
  });
}

if (built.length < 3500) {
  throw new Error(`語数が足りません: ${built.length}`);
}

const words = built.slice(0, 3500).map((word, index) => ({
  id: `w${String(index + 1).padStart(3, "0")}`,
  spanish: word.spanish,
  chunk: word.chunk,
  japanese: word.japanese,
}));

const ids = new Set();
const spans = new Set();
for (const word of words) {
  if (ids.has(word.id)) throw new Error(`ID重複: ${word.id}`);
  ids.add(word.id);
  if (!hasWord(word.chunk, word.spanish)) {
    throw new Error(`検証失敗: ${word.id} ${word.spanish} / ${word.chunk}`);
  }
  if (!word.japanese.trim()) throw new Error(`訳が空: ${word.id}`);
  spans.add(word.spanish.toLowerCase());
}
if (spans.size !== words.length) throw new Error("スペイン語が重複しています");

writeFileSync(join(root, "src/data/words.json"), `${JSON.stringify(words, null, 2)}\n`);
console.log(`wrote ${words.length} words, source had ${built.length}`);
