/**
 * dialogues_tomodachi.js - Tomodachi Life Dialogue Database with Mood (20+ types), Personality & Relationship Adaptations
 */

window.TomodachiDialogues = {
  moods: [
    { name: '最高', icon: '🌟' },
    { name: 'ごきげん', icon: '😊' },
    { name: 'ルンルン', icon: '🎶' },
    { name: 'ウキウキ', icon: '✨' },
    { name: 'テンション爆発', icon: '🔥' },
    { name: '普通', icon: '😐' },
    { name: 'まったり', icon: '☕' },
    { name: 'ぼーっと', icon: '🌀' },
    { name: 'イライラ', icon: '⚡' },
    { name: 'ぷんぷん', icon: '💢' },
    { name: '激怒', icon: '👿' },
    { name: '落ち込み', icon: '😞' },
    { name: 'シクシク', icon: '😭' },
    { name: '絶望', icon: '🥀' },
    { name: 'メロメロ', icon: '😍' },
    { name: 'テレテレ', icon: '😳' },
    { name: 'お腹ペコペコ', icon: '🍚' },
    { name: '眠気全開', icon: '💤' },
    { name: 'どきどき', icon: '💓' },
    { name: 'ルンルンランラン', icon: '🎵' },
    { name: 'ウキウキワクワク', icon: '💫' },
    { name: 'ツンツン', icon: '😤' }
  ],

  // Generate dialogue dynamic to Mood, Personality, and Relationship
  generateDialogue(resident, targetResident = null, relationshipType = '友達') {
    let mood = resident.mood || '普通';
    let personality = resident.personality || 'マイペース';

    // 1. Mood-Based Specific Lines
    if (mood === 'イライラ' || mood === '激怒' || mood === 'ぷんぷん') {
      if (personality === 'ツンデレ') return "べ、別に怒ってないし！あっち行ってよ！";
      if (personality === 'クール') return "今は誰とも話したくない気分なんだ。放っておいて。";
      if (personality === 'あほ') return "あー！靴下が裏返しでイライラするー！";
      return "もう！なんか今日はいろいろ上手くいかなくてプンプンだよ！";
    }

    if (mood === '最高' || mood === 'テンション爆発' || mood === 'ルンルンランラン') {
      if (personality === '天然') return "わぁ～い！今日なんだか空がピンク色に見えるよ～！";
      if (personality === 'あほ') return "今なら空も飛べそうな気がする！ハイパーモード発動！";
      if (personality === 'ロマンチスト') return "世界が僕たちを祝福して輝いているようだね✨";
      return "最高にハッピーな気分！スキップしながら歩いちゃおう♪";
    }

    if (mood === '落ち込み' || mood === 'シクシク' || mood === '絶望') {
      return "うぅ…なんか急に悲しくなってきちゃった…シクシク(涙)";
    }

    if (mood === 'メロメロ' || mood === 'テレテレ') {
      if (targetResident) return `「${targetResident.name}さんの顔を見るだけで胸がキュンキュンしちゃうな💕」`;
      return "恋をすると世界がこんなにキュートに見えるんだね…照";
    }

    if (mood === 'お腹ペコペコ') {
      return "お腹と背中がくっついちゃう～！ラーメンと餃子を大盛りで食べたい！";
    }

    if (mood === '眠気全開') {
      return "ふぁぁ…まぶたが10キロくらい重いよ…すやすや…Zzz";
    }

    // 2. Personality-Based Specific Lines
    if (personality === 'マイペース') {
      const list = [
        "自分のペースで生きるのが一番だよね～のんびり行こう",
        "時計の針をじーっと見つめる時間、結構好きなんだよね",
        "明日のことは明日考える！今日は今日を楽しむのだ～"
      ];
      return list[Math.floor(Math.random() * list.length)];
    }

    if (personality === '天然') {
      const list = [
        "あっ、左右違う靴下履いてきちゃった！まぁオシャレってことで♪",
        "カフェで『氷抜きのアイスコーヒー』頼んだら常温の珈琲が出てきたの！不思議！",
        "ねえ、鳩って歩く時なんで首を振るんだろう？真似したら首痛めたよ"
      ];
      return list[Math.floor(Math.random() * list.length)];
    }

    if (personality === 'あほ') {
      const list = [
        "バナナの皮で滑って転ぶ練習してるんだ！プロの転び手を目指すぞ！",
        "鼻からスパゲッティを食べる夢を見たんだけど…正夢になったらどうしよう！",
        "じゃんけんで絶対勝てる魔法のポーズを発明したよ！"
      ];
      return list[Math.floor(Math.random() * list.length)];
    }

    if (personality === 'ツンデレ') {
      const list = [
        "べ、別にみんなと話したくてここに来たわけじゃないんだからね！",
        "ふんっ！私のこと気にしてる暇があったら自分の心配しなさいよ！",
        "…感謝くらいしてあげてもいいけど。かんちがいしないでよね！"
      ];
      return list[Math.floor(Math.random() * list.length)];
    }

    // 3. Default Tomodachi Life Lines
    const defaultChats = [
      "なんかお腹すいたな…無性にラーメンが食べたい気分！",
      "今日夢で空飛ぶパンダとダンシングしたんだ～！",
      "好きな食べ物は一番最後に食べて幸せで締めくくる派！",
      "時々、宇宙の端っこってどうなってるか考えちゃうよね",
      "ねえ、今日の私の前髪変じゃないかな？ドキドキ…",
      "カフェの焼きたてクロワッサン、サックサクで神だった！",
      "夜中に冷蔵庫開けてウロウロしちゃう現象に名前つけたい"
    ];
    return defaultChats[Math.floor(Math.random() * defaultChats.length)];
  }
};
