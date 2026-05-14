---
title: "Kerberoasting Attack"
description: "Abusing Kerberos service tickets in Active Directory"
date: 2026-05-13
draft: false
---

# Overview

Kerberoasting is a technique used to extract service ticket hashes from Active Directory for offline password cracking.

# Enumeration

Enumerated SPNs using PowerView and Impacket tools.

# Exploitation

Requested TGS tickets and extracted crackable hashes.

# Impact

Weak service account passwords can lead to privilege escalation and lateral movement.

# Mitigation

- Use strong passwords
- Use gMSA accounts
- Monitor abnormal TGS requests
