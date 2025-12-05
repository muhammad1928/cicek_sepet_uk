const translations = {
    // ============================================================
    // 🇬🇧 ENGLISH (DEFAULT)
    // ============================================================
    en: {
        // --- AUTH EMAILS ---
        verifySubject: "Verify Your Account - CicekSepeti UK",
        verifyTitle: "Welcome,",
        verifyMsg: "Thank you for joining the CicekSepeti UK family. Please click the button below to verify your email address and activate your account:",
        verifyBtn: "Verify My Account",
        verifyLinkFooter: "If the button doesn't work, copy and paste this link into your browser:",

        welcomeGiftSubject: "Welcome Gift! 🎁",
        welcomeGiftTitle: "Account Verified!",
        welcomeGiftMsg: "Welcome aboard! Here is a special 10% discount coupon for your first order:",
        loginBtn: "Login Now",

        resetPwdSubject: "Password Reset Request 🔒",
        resetPwdMsg: "You have requested to reset your password. Click the button below to create a new one:",
        resetPwdBtn: "Reset Password",
        resetPwdFooter: "If you didn't request this, please ignore this email. Your account is safe.",

        pwdChangedSubject: "Security Alert: Password Changed",
        pwdChangedMsg: "Your password has been successfully updated. If this wasn't you, please contact support immediately.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "Order Received! 🌸",
        orderTitle: "Hello,",
        orderMsg: "Your order has been successfully placed. We are getting it ready!",

        // Order Summary Labels
        orderSummaryTitle: "Order Summary",
        subtotal: "Subtotal",
        discount: "Discount",
        delivery: "Delivery",
        free: "Free",
        total: "Total",
        deliveryAddress: "Delivery Address",
        trackOrderBtn: "Track Your Order",

        // Order Status Updates
        statusPreparing: "Order Preparing 🎁",
        msgPreparing: "Your order has been confirmed and is being prepared with care.",

        statusOnWay: "Order On The Way 🛵",
        msgOnWay: "Your order has been handed over to our courier and is on its way to the delivery address.",

        statusDelivered: "Delivered Successfully ✅",
        msgDelivered: "Your order has been successfully delivered. Thank you for choosing us to share your happiness.",

        statusCancelled: "Order Cancelled ❌",
        msgCancelled: "Your order has been cancelled. <br/><br/><b>Refund Info:</b> Your refund will be processed and reflected in your bank account within <b>3-5 business days</b>.",

        statusCancelRequest: "Cancellation Request Received 📩",
        msgCancelRequest: "We have received your cancellation request. Our team will review it shortly.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "New Order Received! 📦",
        newOrderMsg: "You have a new order awaiting preparation.",
        vendorEarnings: "Total Earnings",
        vendorPanelBtn: "Go to Vendor Panel",

        vendorCancelSubject: "Order Cancelled ❌",
        vendorCancelMsg: "has been cancelled. Please DO NOT prepare or ship this item.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "STOP! JOB CANCELLED 🛑",
        courierCancelMsg: "has been cancelled by the system. Please DO NOT proceed to the pickup/delivery location."
    },

    // ============================================================
    // 🇹🇷 TÜRKÇE
    // ============================================================
    tr: {
        // --- AUTH EMAILS ---
        verifySubject: "Hesabınızı Onaylayın - ÇiçekSepeti UK",
        verifyTitle: "Hoşgeldiniz,",
        verifyMsg: "ÇiçekSepeti UK ailesine katıldığınız için teşekkürler. Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:",
        verifyBtn: "Hesabımı Onayla",
        verifyLinkFooter: "Eğer buton çalışmıyorsa, şu linki tarayıcınıza yapıştırın:",

        welcomeGiftSubject: "Hoşgeldin Hediyesi! 🎁",
        welcomeGiftTitle: "Hesap Onaylandı!",
        welcomeGiftMsg: "Aramıza hoşgeldiniz! İlk siparişinize özel %10 indirim kuponunuz burada:",
        loginBtn: "Hemen Giriş Yap",

        resetPwdSubject: "Şifre Sıfırlama İsteği 🔒",
        resetPwdMsg: "Şifrenizi yenilemek için bir istek aldık. Yeni şifrenizi oluşturmak için butona tıklayın:",
        resetPwdBtn: "Şifremi Sıfırla",
        resetPwdFooter: "Bu isteği siz yapmadıysanız, bu maili görmezden gelebilirsiniz.",

        pwdChangedSubject: "Güvenlik Uyarısı: Şifre Değişti",
        pwdChangedMsg: "Şifreniz başarıyla güncellendi. Bu işlemi siz yapmadıysanız derhal bizimle iletişime geçin.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "Siparişiniz Alındı! 🌸",
        orderTitle: "Merhaba,",
        orderMsg: "Siparişiniz başarıyla oluşturuldu. Hazırlıklara başladık!",

        // Order Summary Labels
        orderSummaryTitle: "Sipariş Özeti",
        subtotal: "Ara Toplam",
        discount: "İndirim",
        delivery: "Kargo",
        free: "Ücretsiz",
        total: "Toplam",
        deliveryAddress: "Teslimat Adresi",
        trackOrderBtn: "Siparişi Takip Et",

        // Order Status Updates
        statusPreparing: "Sipariş Hazırlanıyor 🎁",
        msgPreparing: "Siparişiniz onaylandı ve özenle hazırlanıyor.",

        statusOnWay: "Sipariş Yola Çıktı 🛵",
        msgOnWay: "Siparişiniz kuryemize teslim edildi ve adresinize doğru yola çıktı.",

        statusDelivered: "Teslimat Başarılı ✅",
        msgDelivered: "Siparişiniz başarıyla teslim edildi. Mutluluğu paylaştığınız için teşekkür ederiz.",

        statusCancelled: "Sipariş İptali ❌",
        msgCancelled: "Siparişiniz iptal edilmiştir. <br/><br/><b>İade Bilgisi:</b> Ücret iadeniz <b>3-5 iş günü</b> içinde bankanıza yansıyacaktır.",

        statusCancelRequest: "İptal Talebi Alındı 📩",
        msgCancelRequest: "Sipariş iptal talebiniz bize ulaştı. Müşteri temsilcimiz en kısa sürede inceleyip dönüş yapacaktır.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "Yeni Siparişiniz Var! 📦",
        newOrderMsg: "Mağazanızdan yeni bir ürün sipariş edildi.",
        vendorEarnings: "Toplam Hakediş",
        vendorPanelBtn: "Mağaza Paneline Git",

        vendorCancelSubject: "Sipariş İptal Edildi ❌",
        vendorCancelMsg: "numaralı sipariş iptal edilmiştir. Lütfen ürünü hazırlamayın veya kargolamayın.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "DUR! GÖREV İPTAL 🛑",
        courierCancelMsg: "numaralı sipariş iptal edilmiştir. Lütfen teslimat veya alım noktasına GİTMEYİNİZ."
    },
    // ============================================================
    // 🇸🇪 SVENSKA (İSVEÇÇE)
    // ============================================================
    sv: {
        // --- AUTH EMAILS ---
        verifySubject: "Verifiera ditt konto - ÇiçekSepeti UK",
        verifyTitle: "Välkommen,",
        verifyMsg: "Tack för att du gick med i ÇiçekSepeti UK-familjen. Klicka på knappen nedan för att aktivera ditt konto:",
        verifyBtn: "Verifiera mitt konto",
        verifyLinkFooter: "Om knappen inte fungerar, klistra in denna länk i din webbläsare:",

        welcomeGiftSubject: "Välkomstgåva! 🎁",
        welcomeGiftTitle: "Kontot verifierat!",
        welcomeGiftMsg: "Välkommen till oss! Här är din 10% rabattkupong för din första beställning:",
        loginBtn: "Logga in nu",

        resetPwdSubject: "Begäran om lösenordsåterställning 🔒",
        resetPwdMsg: "Vi har fått en begäran om att återställa ditt lösenord. Klicka på knappen för att skapa ett nytt lösenord:",
        resetPwdBtn: "Återställ lösenord",
        resetPwdFooter: "Om du inte gjorde denna begäran kan du ignorera detta mail.",

        pwdChangedSubject: "Säkerhetsmeddelande: Lösenord ändrat",
        pwdChangedMsg: "Ditt lösenord har uppdaterats. Om du inte gjorde denna ändring, kontakta oss omedelbart.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "Din beställning har mottagits! 🌸",
        orderTitle: "Hej,",
        orderMsg: "Din beställning har skapats. Vi har börjat förbereda den!",

        // Order Summary Labels
        orderSummaryTitle: "Beställningsöversikt",
        subtotal: "Delsumma",
        discount: "Rabatt",
        delivery: "Frakt",
        free: "Gratis",
        total: "Totalt",
        deliveryAddress: "Leveransadress",
        trackOrderBtn: "Spåra beställning",

        // Order Status Updates
        statusPreparing: "Beställning förbereds 🎁",
        msgPreparing: "Din beställning har bekräftats och förbereds med omsorg.",

        statusOnWay: "Beställning på väg 🛵",
        msgOnWay: "Din beställning har överlämnats till vår kurir och är på väg till dig.",

        statusDelivered: "Leverans slutförd ✅",
        msgDelivered: "Din beställning har levererats. Tack för att du delar glädjen med oss.",

        statusCancelled: "Beställning avbruten ❌",
        msgCancelled: "Din beställning har avbrutits. <br/><br/><b>Återbetalningsinformation:</b> Din återbetalning kommer att visas på ditt bankkonto inom <b>3-5 arbetsdagar</b>.",

        statusCancelRequest: "Avbokningsbegäran mottagen 📩",
        msgCancelRequest: "Din begäran om att avbryta beställningen har mottagits. Vår kundtjänst kommer att granska och återkomma till dig så snart som möjligt.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "Du har en ny beställning! 📦",
        newOrderMsg: "En ny produkt har beställts från din butik.",
        vendorEarnings: "Total intäkt",
        vendorPanelBtn: "Gå till butikspanelen",

        vendorCancelSubject: "Beställning avbruten ❌",
        vendorCancelMsg: "Beställning har avbrutits. Vänligen förbered eller skicka inte produkten.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "STOPP! UPPDRAG AVBRUTET 🛑",
        courierCancelMsg: "Beställning har avbrutits. Vänligen GÅ INTE till leverans- eller upphämtningspunkten."
    },

    // ============================================================
    // 🇩🇪 DEUTSCH (ALMANCA)
    // ============================================================
    de: {
        // --- AUTH EMAILS ---
        verifySubject: "Bestätigen Sie Ihr Konto - ÇiçekSepeti UK",
        verifyTitle: "Willkommen,",
        verifyMsg: "Vielen Dank, dass Sie der ÇiçekSepeti UK-Familie beigetreten sind. Klicken Sie auf die Schaltfläche unten, um Ihr Konto zu aktivieren:",
        verifyBtn: "Mein Konto bestätigen",
        verifyLinkFooter: "Falls die Schaltfläche nicht funktioniert, fügen Sie diesen Link in Ihren Browser ein:",

        welcomeGiftSubject: "Willkommensgeschenk! 🎁",
        welcomeGiftTitle: "Konto bestätigt!",
        welcomeGiftMsg: "Willkommen bei uns! Hier ist Ihr 10% Rabattgutschein für Ihre erste Bestellung:",
        loginBtn: "Jetzt anmelden",

        resetPwdSubject: "Anfrage zur Passwortzurücksetzung 🔒",
        resetPwdMsg: "Wir haben eine Anfrage zur Zurücksetzung Ihres Passworts erhalten. Klicken Sie auf die Schaltfläche, um ein neues Passwort zu erstellen:",
        resetPwdBtn: "Passwort zurücksetzen",
        resetPwdFooter: "Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.",

        pwdChangedSubject: "Sicherheitshinweis: Passwort geändert",
        pwdChangedMsg: "Ihr Passwort wurde aktualisiert. Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie uns bitte umgehend.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "Ihre Bestellung ist eingegangen! 🌸",
        orderTitle: "Hallo,",
        orderMsg: "Ihre Bestellung wurde erfolgreich erstellt. Wir haben mit den Vorbereitungen begonnen!",

        // Order Summary Labels
        orderSummaryTitle: "Bestellübersicht",
        subtotal: "Zwischensumme",
        discount: "Rabatt",
        delivery: "Versand",
        free: "Kostenlos",
        total: "Gesamt",
        deliveryAddress: "Lieferadresse",
        trackOrderBtn: "Bestellung verfolgen",

        // Order Status Updates
        statusPreparing: "Bestellung wird vorbereitet 🎁",
        msgPreparing: "Ihre Bestellung wurde bestätigt und wird sorgfältig vorbereitet.",

        statusOnWay: "Bestellung unterwegs 🛵",
        msgOnWay: "Ihre Bestellung wurde an unseren Kurier übergeben und ist auf dem Weg zu Ihnen.",

        statusDelivered: "Lieferung erfolgreich ✅",
        msgDelivered: "Ihre Bestellung wurde erfolgreich zugestellt. Vielen Dank, dass Sie die Freude mit uns teilen.",

        statusCancelled: "Bestellung storniert ❌",
        msgCancelled: "Ihre Bestellung wurde storniert. <br/><br/><b>Erstattungsinformation:</b> Ihre Rückerstattung wird innerhalb von <b>3-5 Werktagen</b> auf Ihrem Bankkonto gutgeschrieben.",

        statusCancelRequest: "Stornierungsanfrage erhalten 📩",
        msgCancelRequest: "Ihre Anfrage zur Bestellstornierung ist bei uns eingegangen. Unser Kundenservice wird diese prüfen und sich so schnell wie möglich bei Ihnen melden.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "Sie haben eine neue Bestellung! 📦",
        newOrderMsg: "Ein neues Produkt wurde in Ihrem Shop bestellt.",
        vendorEarnings: "Gesamteinnahmen",
        vendorPanelBtn: "Zum Shop-Panel",

        vendorCancelSubject: "Bestellung storniert ❌",
        vendorCancelMsg: "Bestellung wurde storniert. Bitte bereiten Sie das Produkt nicht vor und versenden Sie es nicht.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "STOPP! AUFTRAG ABGEBROCHEN 🛑",
        courierCancelMsg: "Bestellung wurde storniert. Bitte FAHREN SIE NICHT zum Liefer- oder Abholpunkt."
    },
    // ============================================================
    // 🇮🇹 ITALIANO (İTALYANCA)
    // ============================================================
    it: {
        // --- AUTH EMAILS ---
        verifySubject: "Verifica il tuo account - ÇiçekSepeti UK",
        verifyTitle: "Benvenuto,",
        verifyMsg: "Grazie per esserti unito alla famiglia ÇiçekSepeti UK. Clicca sul pulsante qui sotto per attivare il tuo account:",
        verifyBtn: "Verifica il mio account",
        verifyLinkFooter: "Se il pulsante non funziona, incolla questo link nel tuo browser:",

        welcomeGiftSubject: "Regalo di benvenuto! 🎁",
        welcomeGiftTitle: "Account verificato!",
        welcomeGiftMsg: "Benvenuto tra noi! Ecco il tuo coupon sconto del 10% per il tuo primo ordine:",
        loginBtn: "Accedi ora",

        resetPwdSubject: "Richiesta di reimpostazione password 🔒",
        resetPwdMsg: "Abbiamo ricevuto una richiesta per reimpostare la tua password. Clicca sul pulsante per creare una nuova password:",
        resetPwdBtn: "Reimposta password",
        resetPwdFooter: "Se non hai effettuato questa richiesta, puoi ignorare questa email.",

        pwdChangedSubject: "Avviso di sicurezza: Password modificata",
        pwdChangedMsg: "La tua password è stata aggiornata. Se non hai effettuato questa modifica, contattaci immediatamente.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "Il tuo ordine è stato ricevuto! 🌸",
        orderTitle: "Ciao,",
        orderMsg: "Il tuo ordine è stato creato con successo. Abbiamo iniziato a prepararlo!",

        // Order Summary Labels
        orderSummaryTitle: "Riepilogo ordine",
        subtotal: "Subtotale",
        discount: "Sconto",
        delivery: "Spedizione",
        free: "Gratuita",
        total: "Totale",
        deliveryAddress: "Indirizzo di consegna",
        trackOrderBtn: "Traccia ordine",

        // Order Status Updates
        statusPreparing: "Ordine in preparazione 🎁",
        msgPreparing: "Il tuo ordine è stato confermato e viene preparato con cura.",

        statusOnWay: "Ordine in consegna 🛵",
        msgOnWay: "Il tuo ordine è stato affidato al nostro corriere ed è in viaggio verso di te.",

        statusDelivered: "Consegna completata ✅",
        msgDelivered: "Il tuo ordine è stato consegnato con successo. Grazie per aver condiviso la gioia con noi.",

        statusCancelled: "Ordine annullato ❌",
        msgCancelled: "Il tuo ordine è stato annullato. <br/><br/><b>Informazioni sul rimborso:</b> Il rimborso sarà accreditato sul tuo conto bancario entro <b>3-5 giorni lavorativi</b>.",

        statusCancelRequest: "Richiesta di annullamento ricevuta 📩",
        msgCancelRequest: "La tua richiesta di annullamento ordine è stata ricevuta. Il nostro servizio clienti la esaminerà e ti contatterà al più presto.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "Hai un nuovo ordine! 📦",
        newOrderMsg: "Un nuovo prodotto è stato ordinato dal tuo negozio.",
        vendorEarnings: "Guadagno totale",
        vendorPanelBtn: "Vai al pannello negozio",

        vendorCancelSubject: "Ordine annullato ❌",
        vendorCancelMsg: "L'ordine è stato annullato. Si prega di non preparare o spedire il prodotto.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "STOP! INCARICO ANNULLATO 🛑",
        courierCancelMsg: "L'ordine è stato annullato. Si prega di NON RECARSI al punto di consegna o ritiro."
    },

    // ============================================================
    // 🇫🇷 FRANÇAIS (FRANSIZCA)
    // ============================================================
    fr: {
        // --- AUTH EMAILS ---
        verifySubject: "Vérifiez votre compte - ÇiçekSepeti UK",
        verifyTitle: "Bienvenue,",
        verifyMsg: "Merci d'avoir rejoint la famille ÇiçekSepeti UK. Cliquez sur le bouton ci-dessous pour activer votre compte :",
        verifyBtn: "Vérifier mon compte",
        verifyLinkFooter: "Si le bouton ne fonctionne pas, collez ce lien dans votre navigateur :",

        welcomeGiftSubject: "Cadeau de bienvenue ! 🎁",
        welcomeGiftTitle: "Compte vérifié !",
        welcomeGiftMsg: "Bienvenue parmi nous ! Voici votre coupon de réduction de 10% pour votre première commande :",
        loginBtn: "Se connecter maintenant",

        resetPwdSubject: "Demande de réinitialisation du mot de passe 🔒",
        resetPwdMsg: "Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton pour créer un nouveau mot de passe :",
        resetPwdBtn: "Réinitialiser le mot de passe",
        resetPwdFooter: "Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail.",

        pwdChangedSubject: "Alerte de sécurité : Mot de passe modifié",
        pwdChangedMsg: "Votre mot de passe a été mis à jour. Si vous n'avez pas effectué cette modification, veuillez nous contacter immédiatement.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "Votre commande a été reçue ! 🌸",
        orderTitle: "Bonjour,",
        orderMsg: "Votre commande a été créée avec succès. Nous avons commencé la préparation !",

        // Order Summary Labels
        orderSummaryTitle: "Récapitulatif de commande",
        subtotal: "Sous-total",
        discount: "Réduction",
        delivery: "Livraison",
        free: "Gratuite",
        total: "Total",
        deliveryAddress: "Adresse de livraison",
        trackOrderBtn: "Suivre la commande",

        // Order Status Updates
        statusPreparing: "Commande en préparation 🎁",
        msgPreparing: "Votre commande a été confirmée et est préparée avec soin.",

        statusOnWay: "Commande en route 🛵",
        msgOnWay: "Votre commande a été remise à notre coursier et est en route vers vous.",

        statusDelivered: "Livraison réussie ✅",
        msgDelivered: "Votre commande a été livrée avec succès. Merci de partager la joie avec nous.",

        statusCancelled: "Commande annulée ❌",
        msgCancelled: "Votre commande a été annulée. <br/><br/><b>Information de remboursement :</b> Votre remboursement sera crédité sur votre compte bancaire dans un délai de <b>3 à 5 jours ouvrables</b>.",

        statusCancelRequest: "Demande d'annulation reçue 📩",
        msgCancelRequest: "Votre demande d'annulation de commande a été reçue. Notre service client l'examinera et vous recontactera dans les plus brefs délais.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "Vous avez une nouvelle commande ! 📦",
        newOrderMsg: "Un nouveau produit a été commandé dans votre boutique.",
        vendorEarnings: "Gains totaux",
        vendorPanelBtn: "Accéder au panneau boutique",

        vendorCancelSubject: "Commande annulée ❌",
        vendorCancelMsg: "La commande a été annulée. Veuillez ne pas préparer ou expédier le produit.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "STOP ! MISSION ANNULÉE 🛑",
        courierCancelMsg: "La commande a été annulée. Veuillez NE PAS VOUS RENDRE au point de livraison ou de collecte."
    },
    // ============================================================
    // 🇳🇱 NEDERLANDS (HOLLANDACA)
    // ============================================================
    nl: {
        // --- AUTH EMAILS ---
        verifySubject: "Verifieer je account - ÇiçekSepeti UK",
        verifyTitle: "Welkom,",
        verifyMsg: "Bedankt dat je lid bent geworden van de ÇiçekSepeti UK-familie. Klik op de onderstaande knop om je account te activeren:",
        verifyBtn: "Mijn account verifiëren",
        verifyLinkFooter: "Als de knop niet werkt, plak deze link in je browser:",

        welcomeGiftSubject: "Welkomstcadeau! 🎁",
        welcomeGiftTitle: "Account geverifieerd!",
        welcomeGiftMsg: "Welkom bij ons! Hier is je 10% kortingscode voor je eerste bestelling:",
        loginBtn: "Nu inloggen",

        resetPwdSubject: "Verzoek om wachtwoord opnieuw in te stellen 🔒",
        resetPwdMsg: "We hebben een verzoek ontvangen om je wachtwoord opnieuw in te stellen. Klik op de knop om een nieuw wachtwoord aan te maken:",
        resetPwdBtn: "Wachtwoord opnieuw instellen",
        resetPwdFooter: "Als je dit verzoek niet hebt gedaan, kun je deze e-mail negeren.",

        pwdChangedSubject: "Beveiligingsmelding: Wachtwoord gewijzigd",
        pwdChangedMsg: "Je wachtwoord is bijgewerkt. Als je deze wijziging niet hebt aangebracht, neem dan onmiddellijk contact met ons op.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "Je bestelling is ontvangen! 🌸",
        orderTitle: "Hallo,",
        orderMsg: "Je bestelling is succesvol aangemaakt. We zijn begonnen met de voorbereiding!",

        // Order Summary Labels
        orderSummaryTitle: "Besteloverzicht",
        subtotal: "Subtotaal",
        discount: "Korting",
        delivery: "Verzending",
        free: "Gratis",
        total: "Totaal",
        deliveryAddress: "Bezorgadres",
        trackOrderBtn: "Bestelling volgen",

        // Order Status Updates
        statusPreparing: "Bestelling wordt voorbereid 🎁",
        msgPreparing: "Je bestelling is bevestigd en wordt met zorg voorbereid.",

        statusOnWay: "Bestelling onderweg 🛵",
        msgOnWay: "Je bestelling is overgedragen aan onze koerier en is onderweg naar jou.",

        statusDelivered: "Levering voltooid ✅",
        msgDelivered: "Je bestelling is succesvol bezorgd. Bedankt voor het delen van vreugde met ons.",

        statusCancelled: "Bestelling geannuleerd ❌",
        msgCancelled: "Je bestelling is geannuleerd. <br/><br/><b>Terugbetalingsinformatie:</b> Je terugbetaling wordt binnen <b>3-5 werkdagen</b> op je bankrekening bijgeschreven.",

        statusCancelRequest: "Annuleringsverzoek ontvangen 📩",
        msgCancelRequest: "Je verzoek om de bestelling te annuleren is ontvangen. Onze klantenservice zal dit beoordelen en zo snel mogelijk contact met je opnemen.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "Je hebt een nieuwe bestelling! 📦",
        newOrderMsg: "Er is een nieuw product besteld in je winkel.",
        vendorEarnings: "Totale verdiensten",
        vendorPanelBtn: "Naar winkelpaneel",

        vendorCancelSubject: "Bestelling geannuleerd ❌",
        vendorCancelMsg: "De bestelling is geannuleerd. Bereid het product niet voor en verzend het niet.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "STOP! OPDRACHT GEANNULEERD 🛑",
        courierCancelMsg: "De bestelling is geannuleerd. GA NIET naar het bezorg- of ophaalpunt."
    },

    // ============================================================
    // 🇪🇸 ESPAÑOL (İSPANYOLCA)
    // ============================================================
    es: {
        // --- AUTH EMAILS ---
        verifySubject: "Verifica tu cuenta - ÇiçekSepeti UK",
        verifyTitle: "Bienvenido,",
        verifyMsg: "Gracias por unirte a la familia ÇiçekSepeti UK. Haz clic en el botón de abajo para activar tu cuenta:",
        verifyBtn: "Verificar mi cuenta",
        verifyLinkFooter: "Si el botón no funciona, pega este enlace en tu navegador:",

        welcomeGiftSubject: "¡Regalo de bienvenida! 🎁",
        welcomeGiftTitle: "¡Cuenta verificada!",
        welcomeGiftMsg: "¡Bienvenido! Aquí tienes tu cupón de descuento del 10% para tu primer pedido:",
        loginBtn: "Iniciar sesión ahora",

        resetPwdSubject: "Solicitud de restablecimiento de contraseña 🔒",
        resetPwdMsg: "Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva contraseña:",
        resetPwdBtn: "Restablecer contraseña",
        resetPwdFooter: "Si no realizaste esta solicitud, puedes ignorar este correo.",

        pwdChangedSubject: "Alerta de seguridad: Contraseña cambiada",
        pwdChangedMsg: "Tu contraseña ha sido actualizada. Si no realizaste este cambio, contáctanos inmediatamente.",

        // --- ORDER EMAILS (CUSTOMER) ---
        orderSubject: "¡Tu pedido ha sido recibido! 🌸",
        orderTitle: "Hola,",
        orderMsg: "Tu pedido ha sido creado con éxito. ¡Hemos comenzado a prepararlo!",

        // Order Summary Labels
        orderSummaryTitle: "Resumen del pedido",
        subtotal: "Subtotal",
        discount: "Descuento",
        delivery: "Envío",
        free: "Gratis",
        total: "Total",
        deliveryAddress: "Dirección de entrega",
        trackOrderBtn: "Seguir pedido",

        // Order Status Updates
        statusPreparing: "Pedido en preparación 🎁",
        msgPreparing: "Tu pedido ha sido confirmado y se está preparando con cuidado.",

        statusOnWay: "Pedido en camino 🛵",
        msgOnWay: "Tu pedido ha sido entregado a nuestro mensajero y está en camino hacia ti.",

        statusDelivered: "Entrega completada ✅",
        msgDelivered: "Tu pedido ha sido entregado con éxito. Gracias por compartir la alegría con nosotros.",

        statusCancelled: "Pedido cancelado ❌",
        msgCancelled: "Tu pedido ha sido cancelado. <br/><br/><b>Información de reembolso:</b> Tu reembolso se acreditará en tu cuenta bancaria en un plazo de <b>3 a 5 días hábiles</b>.",

        statusCancelRequest: "Solicitud de cancelación recibida 📩",
        msgCancelRequest: "Tu solicitud de cancelación de pedido ha sido recibida. Nuestro servicio de atención al cliente la revisará y se pondrá en contacto contigo lo antes posible.",

        // --- VENDOR EMAILS ---
        newOrderSubject: "¡Tienes un nuevo pedido! 📦",
        newOrderMsg: "Se ha pedido un nuevo producto en tu tienda.",
        vendorEarnings: "Ganancias totales",
        vendorPanelBtn: "Ir al panel de tienda",

        vendorCancelSubject: "Pedido cancelado ❌",
        vendorCancelMsg: "El pedido ha sido cancelado. Por favor, no prepares ni envíes el producto.",

        // --- COURIER EMAILS ---
        courierCancelSubject: "¡ALTO! MISIÓN CANCELADA 🛑",
        courierCancelMsg: "El pedido ha sido cancelado. Por favor, NO VAYAS al punto de entrega o recogida."
    }
};

module.exports = translations;