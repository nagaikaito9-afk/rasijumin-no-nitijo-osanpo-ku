/**
 * hobbies_system.js - Resident Hobbies (Guitar 🎸, Painting 🎨, Fishing 🎣, Gardening 🌻, Dreams 💭)
 */

window.HobbiesSystem = {
  hobbies: ['guitar', 'painting', 'fishing', 'gardening'],

  triggerRandomHobby(resident) {
    let hobby = this.hobbies[Math.floor(Math.random() * this.hobbies.length)];
    resident.currentHobby = hobby;

    let text = window.TomodachiDialogues.hobbies[hobby];
    resident.say(text, 260);
    resident.setExpression('smile', 240);
    resident.addLog(`趣味の【${hobby}】を夢中で楽しみました！`);
  }
};
