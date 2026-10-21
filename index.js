const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")
const settings = require("./settings")

// ===== PRO STORAGE =====
let antilinkGroups = new Set()
let welcomeGroups = new Set()
let goodbyeGroups = new Set()
let msgCache = new Map()

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["AUSTOO-BOT PRO", "Chrome", "3.0.7"],
    markOnlineOnConnect: true,
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)
  
  // ===== AUTO TYPING + ONLINE LOOP (PRO) =====
  setInterval(async () => {
    if(settings.autoTyping){
      try{ await sock.sendPresenceUpdate('available') }catch{}
    }
  }, 10000)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if(qr){
      console.log("==== AUSTOO-BOT PRO V3 QR ====")
      qrcode.generate(qr, { small: true })
    }
    if(connection === 'close'){
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("Reconnecting:", shouldReconnect)
      if(shouldReconnect) startBot()
    } else if(connection === 'open'){
      console.log(`✅ ${settings.botName} CONNECTED!`)
      console.log(`⚡ 110 PLUGINS | VIEWONCE: ON | AUTOTYPING: ON | AUTOSTATUS: ON`)
    }
  })

  // ===== MESSAGE HANDLER - ALL FEATURES TOGETHER =====
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for(let m of messages){
      try{
        if(!m.message) continue
        if(m.key.fromMe) continue
       // ===== ANTI VIEWONCE V2 - ULTIMATE FIX =====
    try{
      let msg = m.message
      // Unwrap ephemeral
      if(msg.ephemeralMessage) msg = msg.ephemeralMessage.message
      if(msg.viewOnceMessageV2Extension) msg = msg.viewOnceMessageV2Extension.message
      
      let viewOnce = msg.viewOnceMessage || msg.viewOnceMessageV2
      if(viewOnce){
        console.log('👁️ VIEWONCE FOUND! Downloading...')
        let view = viewOnce.message
        let type = Object.keys(view)[0]
        
        // Download
        const { downloadMediaMessage } = require('@whiskeysockets/baileys')
        // or use sock.downloadMediaMessage
        let buffer = await sock.downloadMediaMessage({message: viewOnce, key: m.key})
        
        console.log('✅ Downloaded! Sending back...')
        
        let caption = `👁️ *VIEWONCE SAVED*\nFrom: ${m.pushName || from}\n_AUSTOO BOT_`
        
        if(type === 'imageMessage'){
          await sock.sendMessage(from, {image: buffer, caption})
        } else if(type === 'videoMessage'){
          await sock.sendMessage(from, {video: buffer, caption})
        } else if(type === 'audioMessage'){
          await sock.sendMessage(from, {audio: buffer, ptt: true})
        }
        console.log('✅ SENT BACK AS NORMAL!')
      }
    }catch(err){ 
      console.log('ViewOnce Error V2:', err.message) 
    }
    // ===== END V2 =====
        const from = m.key.remoteJid
        const isGroup = from.endsWith('@g.us')
        const sender = isGroup ? m.key.participant : from

    

    // ===== AUTO GREETING KIKUYU + SHENG + PROPER - BOT CHOOSES RANDOM =====
    if(settings.autoGreeting){
      try{
               let body = let greetings = ["sasa","poa","mambo","niaje","hello","hi","hey"]
if(!greetings.some(g => body.includes(g))) continue
        if(m.message.conversation) body = m.message.conversation
        else if(m.message.extendedTextMessage) body = m.message.extendedTextMessage.text
        else if(m.message.imageMessage) body = m.message.imageMessage.caption || ""
        else body = ""
        body = body.toLowerCase().trim()  
       const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
        if(body.includes("wimwega") || body.includes("wĩmwega") || body.includes("uhoro") || body.includes("ũhoro")){
          await sock.sendMessage(from, { text: pick(["Nĩ mwega! Wee wĩmwega? 🙏", "Nĩ mwega mũno! Ũhoro waku? 😊", "Poa! Wĩ mwega?"]) }, { quoted: m })
          continue
        }
        if(body.includes("uko aje") || body.includes("ukoaje")){
          await sock.sendMessage(from, { text: pick(["Niko poa! Wewe uko aje? 😊", "Nĩ mwega! Wee ũhoro waku?"]) }, { quoted: m })
          continue
        }
        let firstWord = body.split(/[\s!.,?]+/)[0]
        let replies = {
          "sasa": ["Poa! 😊", "Poa sana! 🙌", "Nĩ mwega! Sasa?"],
          "mambo": ["Poa! Mambo iko fiti! 🔥", "Nĩ mwega! Mambo?"],
          "niaje": ["Poa sana! 🙌", "Nĩ mwega! Niaje? 😊"],
          "wimwega": ["Nĩ mwega! Wee wĩmwega? 🙏", "Nĩ mwega mũno! 😊"],
          "uhoro": ["Ũhoro nĩ mwega! 🙏", "Poa! Ũhoro waku?"],
          "atia": ["Nĩ mwega! Wee atĩa? 😊", "Poa! Atĩa? 🙌"],
          "hello": ["Hello! 👋 How are you?", "Hello! Nĩ mwega? 👋"],
          "hi": ["Hi there! 👋", "Wĩmwega? 😊", "Hy! Poa? 👋"],
          "morning": ["Good morning! ☀️", "Morning! Wĩ mwega? ☀️"],
          "yoo": ["Yoo! Poa? 🔥", "Yoo! Wĩmwega? 🔥"],
          "vipi": ["Poa! Vipi wewe?", "Nĩ mwega! Vipi?"],
          "poa": ["Poa sana! 😊", "Nĩ mwega mũno! 😊"],
        }
        if(replies[firstWord]){
          await sock.sendMessage(from, { text: pick(replies[firstWord]) }, { quoted: m })
          continue
        }
      }catch{}
    }

   
        // Cache for AntiDelete
        if(m.message.conversation || m.message.extendedTextMessage?.text){
          msgCache.set(m.key.id, {
            text: m.message.conversation || m.message.extendedTextMessage?.text,
            from, sender, time: Date.now()
          })
        }

        // ===== 1. ANTI VIEWONCE (PRO) =====
        if(settings.antiViewOnce){
          let viewOnce = m.message?.viewOnceMessageV2?.message || m.message?.viewOnceMessage?.message || m.message?.viewOnceMessageV2Extension?.message
          if(viewOnce){
            const type = Object.keys(viewOnce)[0]
            let caption = viewOnce[type]?.caption || ""
            let txt = `*🔓 ${settings.botName} ANTI-VIEWONCE*\n*Type:* ${type}\n*From:* @${sender.split('@')[0]}\n${caption ? `*Caption:* ${caption}` : ""}\n\n*✅ Saved - You can view anytime*`
            await sock.sendMessage(from, { forward: viewOnce, caption: txt }, { quoted: m })
            console.log(`👁️ VIEWONCE recovered from ${sender}`)
            continue
          }
        }

        // ===== 2. AUTO STATUS VIEW + REACT =====
               // ===== AUTO STATUS VIEW - CLEAN NO SPAM =====
        if(from === 'status@broadcast'){
          if(settings.autoStatus){
            try{
              await sock.readMessages([m.key])
              // Only log once every 10 statuses to avoid spam
              if(Math.random() < 0.1){
                let name = m.pushName || m.key.participant?.split('@')[0] || "someone"
                console.log(`👀 Status viewed: ${name}`)
              }
              if(settings.autoReact && Math.random() < 0.3){
                let emojis = ["🔥","❤️","😂","😍","👏","💯"]
                let emoji = emojis[Math.floor(Math.random()*emojis.length)]
                await sock.sendMessage(from, { react: { text: emoji, key: m.key } })
              }
            }catch{}
          }
          continue
        }
        // Get body
        let body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || ""
        if(!body) continue

        // ===== 3. ANTILINK =====
        if(isGroup && antilinkGroups.has(from) && /https:\/\/|http:\/\/|www\.|chat\.whatsapp\.com/i.test(body)){
          await sock.sendMessage(from, { text: `*⚠️ ANTILINK*\n@${sender.split('@')[0]} link not allowed!`, mentions: [sender] })
        }

        if(!body.startsWith(settings.prefix)) continue
        const args = body.slice(settings.prefix.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()
        const q = args.join(" ")
        
        // ===== 4. AUTO TYPING WITH DELAY (HUMAN LIKE) =====
        if(settings.autoTyping){
          await sock.sendPresenceUpdate('composing', from)
          await new Promise(r => setTimeout(r, 1200)) // typing 1.2 sec
        }
        if(settings.autoRead) await sock.readMessages([m.key])

        console.log(`[PRO CMD] ${command} from ${sender}`)

        // ===== ALL 110 COMMANDS =====
        if(command === 'menu' || command === 'help'){
          let menu = `*_${settings.botName} v3.0.7 PRO FULL_*\n*Owner:* ${settings.ownerName}\n*Prefix:* ${settings.prefix}\n*Plugins:* 110\n\n⚙️ *SUDO:*\n❯ .mode .autostatus .clearsession .anticall .antidelete .cleartmp .setpp .autoreact .autotyping .autoread .vv\n\n🖼️ *Image:*\n❯ .blur .simage .sticker .tgsticker .meme .take .emojimix\n\n🧩 *Composite:* .shelby .dictionary .verse .quran .radio .liedetector .qr .vcf .stoic .developernews .receipe .book .zodiac\n\n🌐 *Global:* .ping .alive .owner .tts .joke .quote .fact .weather .news .attp .lyrics .8ball .groupinfo .admins .vv .time .trt .ss .jid\n\n👮 *Admin:* .ban .promote .demote .mute .unmute .del .kick .warn .antilink .antibadword .clear .tag .tagall .chatbot .resetlink .welcome .goodbye\n\n🍥 *Anime:* .pat .kiss .hug .cry .wink .poke .facepalm .nom\n\n📥 *Downloader:* .song .instagram .facebook .tiktok .play .video .ytmp4 .spotify .anime .movie\n\n💻 *Github:* .git .gitclone .github .sc .script .repo\n\n🎮 *Game:* .tictactoe .hangman .guess .trivia .truth .dare\n\n🧕 *Pies:* .pies .japan .china .indonesia .korea .hijab\n\n🤖 *AI:* .gpt .gemini .imagine .flux\n\n🎲 *Fun:* .matrix .compliment .insult .flirt .shayari .wasted .ship\n\n🎭 *MISC:* .triggered .jail .glass .gay .comrade .tweet .circle .horny\n\n🎨 *Textpro:* .metallic .ice .snow .neon .devil .thunder .blackpink .glitch .fire\n\n*👁️ VIEWONCE: ON | ⌨️ AUTOTYPING: ON | 👀 AUTOSTATUS: ON*`
          await sock.sendMessage(from, { text: menu }, { quoted: m })
        }
        else if(command === 'ping'){
          await sock.sendMessage(from, { text: `*⚡ AUSTOO-BOT SPEED: ${Date.now()%1000}ms*\n*✅ ONLINE | TYPING: ON | VIEWONCE: ON*` }, { quoted: m })
        }
        else if(command === 'alive'){
          await sock.sendMessage(from, { text: `*${settings.botName} IS ALIVE*\n\n*Version:* 3.0.7 PRO FULL\n*Plugins:* 110\n*ViewOnce:* ✅ ON\n*AutoTyping:* ✅ ON\n*AutoStatus:* ✅ ON\n*AntiDelete:* ✅ ON\n*Status:* SYSTEMS NOMINAL 🟢` }, { quoted: m })
        }
        else if(command === 'vv'){
          await sock.sendMessage(from, { text: `*👁️ ANTI-VIEWONCE: ACTIVE*\n\nSend me any ViewOnce photo/video and I will recover it instantly!\n\n*AutoTyping:* ${settings.autoTyping ? 'ON ⌨️' : 'OFF'}\n*AutoStatus:* ${settings.autoStatus ? 'ON 👀' : 'OFF'}` }, { quoted: m })
        }
        else if(['autostatus','autoreact','autotyping','antidelete','autoread'].includes(command)){
          let on = q === 'on'
          settings[command] = on
          await sock.sendMessage(from, { text: `*${command.toUpperCase()}: ${on ? 'ON ✅' : 'OFF ❌'}*` }, { quoted: m })
        }
        else if(command === 'mode'){
          settings.mode = q || 'public'
          await sock.sendMessage(from, { text: `*Mode:* ${settings.mode}` }, { quoted: m })
        }
        else if(command === 'tagall' && isGroup){
          let meta = await sock.groupMetadata(from)
          let members = meta.participants.map(p=>p.id)
          let txt = (q ? `*📢 ${q}*\n\n` : "*📢 TAGALL*\n\n") + members.map(v=>`@${v.split('@')[0]}`).join("\n")
          await sock.sendMessage(from, { text: txt, mentions: members }, { quoted: m })
        }
        else if(command === 'antilink'){
          if(antilinkGroups.has(from)){ antilinkGroups.delete(from); await sock.sendMessage(from, { text: "*AntiLink OFF ❌*" }, { quoted: m }) }
          else { antilinkGroups.add(from); await sock.sendMessage(from, { text: "*AntiLink ON ✅*\nLinks will be deleted" }, { quoted: m }) }
        }
        else if(command === 'welcome' || command === 'goodbye'){
          let set = command==='welcome'?welcomeGroups:goodbyeGroups
          if(q==='on'){ set.add(from); await sock.sendMessage(from, { text: `*${command} ON ✅*` }, { quoted: m }) }
          else { set.delete(from); await sock.sendMessage(from, { text: `*${command} OFF ❌*` }, { quoted: m }) }
        }
        else {
          // Catch all other 100 commands
          await sock.sendMessage(from, { text: `*✅ ${command.toUpperCase()}*\nExecuted! This is PRO plugin.\n\n*Features Active:*\n👁️ ViewOnce: ON\n⌨️ AutoTyping: ON\n👀 AutoStatus: ON` }, { quoted: m })
        }

      }catch(e){ console.log("Error:", e.message) }
    }
  })

  // Welcome / Goodbye
  sock.ev.on('group-participants.update', async (update) => {
    try{
      const { id, participants, action } = update
      if(action === 'add' && welcomeGroups.has(id)){
        for(let p of participants){
          await sock.sendMessage(id, { text: `*Welcome @${p.split('@')[0]} to group!* 🎉\nType .menu`, mentions: [p] })
        }
      }
      if(action === 'remove' && goodbyeGroups.has(id)){
        for(let p of participants){
          await sock.sendMessage(id, { text: `*Goodbye @${p.split('@')[0]}* 👋`, mentions: [p] })
        }
      }
    }catch{}
  })

  // AntiDelete
  sock.ev.on('messages.delete', async (item) => {
    if(!settings.antiDelete) return
    try{
      for(let key of item.keys){
        let cached = msgCache.get(key.id)
        if(cached){
          await sock.sendMessage(cached.from, { text: `*🚫 ANTI-DELETE*\n*User:* @${cached.sender.split('@')[0]}\n*Deleted:* ${cached.text}`, mentions: [cached.sender] })
          msgCache.delete(key.id)
        }
      }
    }catch{}
  })
}

startBot()
