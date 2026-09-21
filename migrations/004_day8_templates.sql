-- Day 8: English + Hindi templates for 6 key event types

INSERT INTO notification_templates (event_type, channel, locale, subject, body) VALUES
-- MARGIN_CALL
('MARGIN_CALL','sms','en',NULL,'Alert: {{symbol}} requires additional margin of Rs.{{marginRequired}}. Available: Rs.{{availableMargin}}.'),
('MARGIN_CALL','sms','hi',NULL,'अलर्ट: {{symbol}} के लिए Rs.{{marginRequired}} अतिरिक्त मार्जिन आवश्यक है। उपलब्ध: Rs.{{availableMargin}}।'),
('MARGIN_CALL','email','en','Margin Call Alert - {{symbol}}','Your account requires additional margin of Rs.{{marginRequired}} for {{symbol}}. Available margin: Rs.{{availableMargin}}.'),
('MARGIN_CALL','email','hi','मार्जिन कॉल अलर्ट - {{symbol}}','आपके खाते के लिए {{symbol}} हेतु Rs.{{marginRequired}} अतिरिक्त मार्जिन आवश्यक है। उपलब्ध मार्जिन: Rs.{{availableMargin}}।'),
('MARGIN_CALL','push','en','Margin Call - {{symbol}}','Additional margin of Rs.{{marginRequired}} required for {{symbol}}.'),
('MARGIN_CALL','push','hi','मार्जिन कॉल - {{symbol}}','{{symbol}} के लिए Rs.{{marginRequired}} अतिरिक्त मार्जिन आवश्यक है।'),
('MARGIN_CALL','in_app','en','Margin Call - {{symbol}}','Additional margin of Rs.{{marginRequired}} required for {{symbol}}.'),
('MARGIN_CALL','in_app','hi','मार्जिन कॉल - {{symbol}}','{{symbol}} के लिए Rs.{{marginRequired}} अतिरिक्त मार्जिन आवश्यक है।'),

-- ACCOUNT_FRAUD_ALERT
('ACCOUNT_FRAUD_ALERT','sms','en',NULL,'URGENT: Suspicious activity detected on your account. If not you, call us immediately.'),
('ACCOUNT_FRAUD_ALERT','sms','hi',NULL,'तत्काल: आपके खाते पर संदिग्ध गतिविधि देखी गई है। यदि आप नहीं हैं तो तुरंत संपर्क करें।'),
('ACCOUNT_FRAUD_ALERT','email','en','Security Alert - Suspicious Activity Detected','We detected suspicious activity on your account. Please review your recent transactions immediately.'),
('ACCOUNT_FRAUD_ALERT','email','hi','सुरक्षा अलर्ट - संदिग्ध गतिविधि','आपके खाते पर संदिग्ध गतिविधि पाई गई है। कृपया अपने हालिया लेनदेन की तुरंत समीक्षा करें।'),
('ACCOUNT_FRAUD_ALERT','push','en','Security Alert','Suspicious activity detected on your account.'),
('ACCOUNT_FRAUD_ALERT','push','hi','सुरक्षा अलर्ट','आपके खाते पर संदिग्ध गतिविधि।'),
('ACCOUNT_FRAUD_ALERT','in_app','en','Security Alert','Suspicious activity detected. Please review your account.'),
('ACCOUNT_FRAUD_ALERT','in_app','hi','सुरक्षा अलर्ट','संदिग्ध गतिविधि पाई गई। कृपया खाता जांचें।'),

-- TRANSACTION_ALERT
('TRANSACTION_ALERT','email','en','Transaction Alert - Rs.{{amount}}','A transaction of Rs.{{amount}} has been {{transactionType}} on your account. Reference: {{referenceId}}.'),
('TRANSACTION_ALERT','email','hi','लेनदेन अलर्ट - Rs.{{amount}}','आपके खाते पर Rs.{{amount}} का लेनदेन {{transactionType}} हुआ है। संदर्भ: {{referenceId}}।'),
('TRANSACTION_ALERT','push','en','Transaction - Rs.{{amount}}','Rs.{{amount}} {{transactionType}} on your account.'),
('TRANSACTION_ALERT','push','hi','लेनदेन - Rs.{{amount}}','आपके खाते पर Rs.{{amount}} {{transactionType}}।'),
('TRANSACTION_ALERT','in_app','en','Transaction - Rs.{{amount}}','Rs.{{amount}} {{transactionType}} on your account.'),
('TRANSACTION_ALERT','in_app','hi','लेनदेन - Rs.{{amount}}','आपके खाते पर Rs.{{amount}} {{transactionType}}।'),

-- KYC_EXPIRY_URGENT
('KYC_EXPIRY_URGENT','sms','en',NULL,'URGENT: Your KYC document {{document}} expires in {{daysLeft}} days. Update now to avoid service interruption.'),
('KYC_EXPIRY_URGENT','sms','hi',NULL,'तत्काल: आपका KYC दस्तावेज़ {{document}} {{daysLeft}} दिनों में समाप्त होगा। सेवा बाधित न हो इसके लिए अभी अपडेट करें।'),
('KYC_EXPIRY_URGENT','email','en','KYC Expiry Alert - Action Required','Your KYC document ({{document}}) will expire in {{daysLeft}} days. Please update immediately.'),
('KYC_EXPIRY_URGENT','email','hi','KYC समाप्ति अलर्ट - कार्रवाई आवश्यक','आपका KYC दस्तावेज़ ({{document}}) {{daysLeft}} दिनों में समाप्त होगा। कृपया तुरंत अपडेट करें।'),
('KYC_EXPIRY_URGENT','in_app','en','KYC Expiry Alert','Your KYC ({{document}}) expires in {{daysLeft}} days.'),
('KYC_EXPIRY_URGENT','in_app','hi','KYC समाप्ति अलर्ट','आपका KYC ({{document}}) {{daysLeft}} दिनों में समाप्त होगा।'),

-- ORDER_EXECUTED
('ORDER_EXECUTED','sms','en',NULL,'Order executed: {{quantity}} shares of {{symbol}} at Rs.{{price}}. Order ID: {{orderId}}.'),
('ORDER_EXECUTED','sms','hi',NULL,'ऑर्डर निष्पादित: {{symbol}} के {{quantity}} शेयर Rs.{{price}} पर। ऑर्डर ID: {{orderId}}।'),
('ORDER_EXECUTED','email','en','Order Executed - {{symbol}}','Your order for {{quantity}} shares of {{symbol}} at Rs.{{price}} has been executed. Order ID: {{orderId}}.'),
('ORDER_EXECUTED','email','hi','ऑर्डर निष्पादित - {{symbol}}','{{symbol}} के {{quantity}} शेयरों का आपका ऑर्डर Rs.{{price}} पर निष्पादित हुआ। ऑर्डर ID: {{orderId}}।'),
('ORDER_EXECUTED','push','en','Order Executed','{{quantity}} shares of {{symbol}} bought at Rs.{{price}}.'),
('ORDER_EXECUTED','push','hi','ऑर्डर निष्पादित','{{symbol}} के {{quantity}} शेयर Rs.{{price}} पर खरीदे।'),
('ORDER_EXECUTED','in_app','en','Order Executed - {{symbol}}','{{quantity}} shares of {{symbol}} at Rs.{{price}}. ID: {{orderId}}.'),
('ORDER_EXECUTED','in_app','hi','ऑर्डर निष्पादित - {{symbol}}','{{symbol}} के {{quantity}} शेयर Rs.{{price}} पर। ID: {{orderId}}।'),

-- PAYMENT_DUE_TOMORROW
('PAYMENT_DUE_TOMORROW','email','en','Payment Due Tomorrow - Rs.{{amount}}','Your payment of Rs.{{amount}} for {{description}} is due tomorrow. Please ensure sufficient balance.'),
('PAYMENT_DUE_TOMORROW','email','hi','कल भुगतान देय - Rs.{{amount}}','{{description}} के लिए Rs.{{amount}} का भुगतान कल देय है। कृपया पर्याप्त शेष सुनिश्चित करें।'),
('PAYMENT_DUE_TOMORROW','push','en','Payment Due Tomorrow','Rs.{{amount}} due for {{description}}.'),
('PAYMENT_DUE_TOMORROW','push','hi','कल भुगतान देय','{{description}} के लिए Rs.{{amount}} देय।'),
('PAYMENT_DUE_TOMORROW','in_app','en','Payment Due Tomorrow','Rs.{{amount}} due for {{description}} tomorrow.'),
('PAYMENT_DUE_TOMORROW','in_app','hi','कल भुगतान देय','{{description}} के लिए Rs.{{amount}} कल देय है।')

ON CONFLICT ON CONSTRAINT notification_templates_event_type_channel_locale_version_key DO NOTHING;