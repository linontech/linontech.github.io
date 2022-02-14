---
layout: post
title: "Spark Application with Kerberos - Intro"
subtitle: ""
date: 2021-12-4
categories: [技術]
---

Kerberos 是三方認證機制，用戶和服務依賴於第三方（Kerberos 伺服器, KDC）來對彼此進行身份驗證。KDC 包含了一個認證
服務器 (Authenticate Server)，一個票證授權服務器 (Ticket-Granting Server)，以及一個記錄他所知道的 principles
和它們的 Kerberos 密碼的內建資料庫。

### # Principle

一個 Kerberos principle 長得像，

```
username/fully.qualified.domain.name@YOUR-REALM.COM，按照先後順序，
```

它們分別是 primary，instance(option) 和 realm。primary 代表 Kerberos 的用戶，它可以是一個 unix account
比如 ap 帳號，也可以是Hadoop服務的Unix帳號，比如 hdfs。instance 是用來區分單個 user 的多個 principle 時使用。
realm 類似 DNS 中的域，不同的是 DNS 是定義了一組主機名，而 realm 則是定義了一組相關的 principle。

### # Keytab

Keytab 包含了加密的principle鍵值和對應的 Kerberos principle。 它被用來在驗證一個 Kerberos principle，
而不用人為得敲打密碼或者明碼保存密碼了。

```angular2html
A keytab is a file containing pairs of Kerberos principals and encrypted keys (which are derived from the Kerberos password). 
You can use a keytab file to authenticate to various remote systems using Kerberos without entering a password.
```

### # Ticket-Granting ticket TGT
由 KDC 中的 Authenticate Server頒發的票證，使用者帶著這個票證可以向 Server 端請求相應的服務。


### # ccache (Credential Cache)
Credential Cache 也是 Kerberos 驗證身份的一種方式，它持有Kerberos的憑證，使得使用者所執行任務session還有效時，
多次驗證服務器，而不用一直請求 KDC 服務器。


### # Long-running Spark Application with Kerberos

對於一個 Spark Streaming 服務，只要在 spark submit 指令後面加上 --keytab 和 --principle 兩個參數，
Spark 就會幫忙在生命週期終止前，接續的更新 hdfs delegation token 和 login ticket。

#### Reference

1. [Long-running Spark Streaming jobs on YARN cluster](https://mkuthan.github.io/blog/2016/09/30/spark-streaming-on-yarn/)
2. [Spark踩坑之Streaming在Kerberos的hadoop中renew失敗](https://flume.cn/2016/11/24/Spark踩坑之Streaming在Kerberos的hadoop中renew失敗/值)

### # Kafka with a Kerberos Ticket Cache

如果你的 Spark Streaming 任務的串流資料來自於 Kafka，別忘了在 worker node 上面，由於 kafka 的 Kerberos 認證 
也會需要的 keytab 會需要送到 worker node 上面，否則會認證失敗。

jaas_driver.conf

```
KafkaClient {
    com.sun.security.auth.module.Krb5LoginModule required
    useKeyTab=true
    storeKey=true
    keyTab="/path/on/driver/for/keytab"
    principal="user@your.customized.realm.name"
    debug=true
    serviceName="kafka";
};
```

### # Kerberos - Maximum renewable lifetime for Kerberos Ticket



Reference
1. [Running Spark on YARN](https://spark.apache.org/docs/2.4.6/running-on-yarn.html#yarn-specific-kerberos-configuration)
