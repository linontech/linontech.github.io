---
layout: post
title: "Spark程式在獲取Kerberos ticket"
subtitle: ""
date: 2021-12-23
categories: [技術]
---

最近盤點在Hadoop叢集上跑的Spark批次程式，~~你才會發現有些東西放在那邊遲早有一天會臭掉~~，如果沒有寫下來也不會知道這些
程式是怎麼取得Kerberos認證的。因為在執行一些運行時間較長的 Spark ETL 任務的時候會遇到 Kerberos token 的認證過期，
所以才會有這篇文章想要弄清楚 Spark 取得 Kerberos 認證的來龍去脈。具體碰到的情況是HDFS_DELEGATION_TOKEN在Spark
應用程式執行的第7天就會過期，但經過排除這個只是 Hadoop 的一個bug， 只要把 Hadoop 更新到 2.9 之後的版本就不會有問題了，
在另外一篇文章有提到。
所以基本上會需要排除找 Spark Application 的 Kerberos token 過期時間和前面這個問題之間的關係，問題混在一起完全會抓不到重點。

### # Spark Application with Kerberos

查找資料後，發現 Spark 應用程式在執行的時候
會根據下面 3 個文件和 Kerberos KDC server 交互取得在 Hadoop 叢集上執行任務的認證。所以，Spark 應用程式取得的token
的有效期限到底是多長？以及Spark會自動根據使用者指定的Kerberos keytab位置，和特定的 principle，keytab去更新 token 嗎？

- Spark Application eats Kerberos credential cache (KRB5CCNAME) 
KRB5CCNAME environment variable must be set by your Java, it's set automatically after logon to the
credential cache file. It's default path is /tmp/krb5cc_$(id -u)

- krb5.conf 儲存 kdc 服務器的相關配置。By default, krb5.conf should be in the same directory on every
host in your cluster, the default location is /etc/krb5.conf , or you should specify by setting 
spark.driver.extraJavaOptions and spark.executor.extraJavaOptions, 
with -Djava.security.krb5.conf=/path/to/krb5.conf

- keytab，用于存储资源主体的身份验证凭据，它可以包含principals和它們對應的加密principal key


另外，Spark 獲取的 Kerberos token最長有效期限是，由下面五個設定的最小值決定。上面的幾個不同地方的設定的名稱如下，
實踐上也確實符合預期，把前面幾個設定值得大小都調大之後 kinit 還是無法獲得較長時間的 maximum renewable life，
還是需要調整 krbtgt 的 max lifetime。

```angular2html

1. kinit -l 10h -r 7d, 舉例而言，一個 maximum ticket life 10小時，maximum renewable life 7 天的 ticket；
2. /etc/krb5.conf, ticket_lifetime
3. Principal 的 maximum ticket life time
4. kerberos Server上, /var/kerberos/krb5kdc/kdc.conf 設定 max_life 
5. (Microsoft) krbtgt 帳號的 max lifetime

```

### # Reference

1. [Submitting Spark batch applications with Kerberos authentication
](https://www.ibm.com/docs/en/spectrum-conductor/2.5.1?topic=group-submitting-spark-batch-applications-kerberos-authentication)

2. [HowTo: Enable Spark executors to access Kerberized resources
](https://github.com/LucaCanali/Miscellaneous/blob/master/Spark_Notes/Spark_Executors_Kerberos_HowTo.md)

3. [Lifetime of Kerberos tickets](https://stackoverflow.com/questions/14682153/lifetime-of-kerberos-tickets)

4. [Kerberos ticket lifetime-大數據姐姐](https://www.twblogs.net/a/5b885ca02b71775d1cdbeed1)

5. [配置Kerberos认证](https://help.aliyun.com/document_detail/256357.htm)
