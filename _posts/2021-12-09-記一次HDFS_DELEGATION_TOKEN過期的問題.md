---
layout: post
title: "記一次HDFS_DELEGATION_TOKEN過期的問題"
subtitle: ""
date: 2021-12-09
categories: [技術]
---

TL;DR 


[HDFS-9276](https://issues.apache.org/jira/browse/HDFS-9276), [SPARK-11182](https://github.com/apache/spark/pull/9168)


最近開發的Spark Streaming串流程式每七天就會報下面這串 Exception，起初也不以為意覺得是Hadoop叢集的問題，
後來觀察日誌才發現它是每七天就會出現一次，讓程式 crash 掉的問題。可以理解為，每七天Spark的HDFS_DELEGATION_TOKEN
就會失效，也就聯想到Hadoop叢集的 namenode delegation token 的最大lifetime的初始值也是7天。
(dfs.namenode.delegation.token.max-lifetime=604800000ms) and dfs.namenode.delegation.token.renew-
interval=86400000(1 day)


```angular2html
ERROR JobScheduler: Error running job streaming job 1528366650000 ms.0
org.apache.hadoop.ipc.RemoteException(org.apache.hadoop.security.token.SecretManager$InvalidToken):
token (token for spark_online: HDFS_DELEGATION_TOKEN owner=spark@XXXXX, renewer=yarn, realUser=, issueDate=1528232733578, maxDate=1528837533578, sequenceNumber=14567778, masterKeyId=1397)
```


根據不管是 [Spark 2.4.6](https://spark.apache.org/docs/2.4.6/security.html#long-running-applications) 或者 
[Spark 3.0.0](https://spark.apache.org/docs/3.0.0-preview/security.html#long-running-applications) 以上的官方介紹文檔，
都表示Spark本身就可以根據使用者提供的keytab和principle去自動的renew token，關鍵句子如下。


```
Spark supports automatically creating new tokens for these applications when running in YARN mode. 
Kerberos credentials need to be provided to the Spark application via the spark-submit command, using the --principal and --keytab parameters.
```


但是，HDFS-9276說明，在開啟[高可用機制的 Hadoop 叢集](https://codertw.com/程式語言/442243/)上，緩存的 DFSClient 會使用舊的 hdfs_delegation_token 的，從而導致 token 在其最大的生命週期
到達時過期。就是 Spark 在更新 Hadoop HA 叢集的 delegation token 的時候，DFSClient 不會一起更新它的 token (
namenode token)。reference: [sparkThriftserver 长时间运行HDFS_DELEGATION_TOKEN失效问题](https://www.codenong.com/cs106192404/)


解決方法根據 [SPARK-11182](https://github.com/apache/spark/pull/9168) 裡面提到的， 可能的方式：

(1) 更新 Hadoop 的版本到 2.9.0 或以上。（然而我們的版本是 2.6.0，更新的可能性不大）

(2) 調整dfs.namenode.delegation.token.max-lifetime 等於一個較大的值，使得 token 最大生命週期變長，從而滿足使用者需要。

(3) 調整設定 `spark.hadoop.fs.hdfs.impl.disable.cache=true`。然而，好像沒有效果。

目前採用的方式是修改 Hadoop Cluster 上面的 token 的 max-lifetime，並在 token 生命週期到達的時候，排程重啟 Spark 
Structured Streaming 程式以更新 token。


Reference
1. [记一次HDFS Delegation Token失效问题](https://blog.csdn.net/u012150370/article/details/86518366)
2. [hdfs delegation token 过期问题分析](https://www.jianshu.com/p/2904334ae404)
3. [解釋 Hadoop Delegation Token 上篇](https://www.athemaster.com/resources/47)
