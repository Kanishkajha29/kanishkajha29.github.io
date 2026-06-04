---
title: "Active Directory Enumeration: Building a Complete Picture of the Domain"
description: "A practical methodology for enumerating Active Directory environments using PowerView, BloodHound, SharpHound, PowerHuntShares, and the Active Directory PowerShell module."
date: 2026-06-05
draft: false
---

# Active Directory Enumeration: Building a Complete Picture of the Domain

**Estimated Reading Time:** 15–18 min read

**Category:**
Active Directory, Internal Pentesting, Red Teaming

**Tools Covered:**
PowerView, BloodHound, SharpHound, PowerHuntShares, Active Directory Module, Invisi-Shell

---

## Introduction

Before attempting privilege escalation, lateral movement, ACL abuse, or trust exploitation within an Active Directory environment, the first objective is understanding the domain itself.

Many security professionals immediately focus on attack techniques such as Kerberoasting, AS-REP Roasting, delegated permission abuse, or trust exploitation. However, successful Active Directory assessments are built upon one critical phase: **enumeration**.

Enumeration allows us to understand:

* How the environment is structured
* Who controls critical assets
* What systems exist
* Where privilege boundaries reside
* Which attack paths may emerge later

The primary objectives of Active Directory enumeration include:

* Identifying domain users
* Enumerating domain computers
* Discovering privileged groups
* Understanding Organizational Units (OUs)
* Enumerating Group Policy Objects (GPOs)
* Mapping permissions and ACLs
* Discovering accessible SMB shares
* Identifying trust relationships
* Determining local administrative rights
* Building attack paths

This article walks through a complete Active Directory enumeration methodology using PowerView, the Active Directory PowerShell Module, SharpHound, BloodHound, PowerHuntShares, and Invisi-Shell.

---

## Preparing the Enumeration Environment

Before interacting with Active Directory, many operators prefer launching an OPSEC-friendly PowerShell session.

In lab environments, Invisi-Shell is frequently used to reduce PowerShell logging visibility while performing reconnaissance activities.

### Launch Invisi-Shell

```powershell
cd C:\AD\Tools
C:\AD\Tools\InviShell\RunWithRegistryNonAdmin.bat
```

### Import PowerView

```powershell
. C:\AD\Tools\PowerView.ps1
```

Once PowerView is loaded, Active Directory enumeration can begin.

---

## Enumerating Domain Users

The first question we should answer is simple:

> Who exists within the domain?

Every Active Directory environment revolves around user accounts. Enumerating users helps identify:

* Service accounts
* Administrative users
* Delegated operators
* Potential privilege escalation targets

### Using PowerView

```powershell
Get-DomainUser
```

Retrieve only usernames:

```powershell
Get-DomainUser | Select -ExpandProperty samaccountname
```

### Using the Active Directory Module

```powershell
Get-ADUser -Filter *
```

### Example Users Discovered

```text
Administrator
Guest
krbtgt
ciadmin
sqladmin
srvadmin
mgmtadmin
appadmin
sql1admin
svcadmin
testda
```

Several accounts immediately stand out:

* sqladmin
* svcadmin
* ciadmin
* appadmin

Accounts following service-oriented naming conventions often possess elevated privileges and frequently become valuable attack targets during assessments.

---

## Enumerating Domain Computers

After identifying users, the next step is understanding the systems that exist within the domain.

### Using PowerView

```powershell
Get-DomainComputer | Select -ExpandProperty dnshostname
```

### Using the Active Directory Module

```powershell
Get-ADComputer -Filter *
```

### Example Systems Discovered

| System         | Likely Purpose                |
| -------------- | ----------------------------- |
| dcorp-dc       | Domain Controller             |
| dcorp-mssql    | Microsoft SQL Server          |
| dcorp-ci       | Continuous Integration Server |
| dcorp-mgmt     | Management Infrastructure     |
| dcorp-appsrv   | Application Server            |
| dcorp-adminsrv | Administrative Server         |
| dcorp-sql1     | Additional SQL Instance       |

Even before accessing these hosts, naming conventions provide valuable intelligence regarding organizational structure.

---

## Enumerating Privileged Groups

Administrative groups represent some of the highest-value targets in any Active Directory environment.

### Enumerate Domain Admins

```powershell
Get-DomainGroup -Identity "Domain Admins"
```

### Retrieve Group Members

```powershell
Get-DomainGroupMember -Identity "Domain Admins"
```

### Using the Active Directory Module

```powershell
Get-ADGroupMember -Identity "Domain Admins"
```

### Example Results

```text
Administrator
svcadmin
```

This immediately reveals that the service account **svcadmin** possesses Domain Administrator privileges.

Service accounts with elevated permissions are often attractive targets because they are commonly associated with scheduled tasks, automation workflows, and services.

---

## Enumerating Enterprise Administrators

Enterprise Admins possess authority across the entire forest.

### Enumeration

```powershell
Get-DomainGroupMember -Identity "Enterprise Admins" -Domain moneycorp.local
```

### Results

```text
Administrator
```

Understanding forest-level administration becomes especially important when multiple domains exist within the environment.

---

## Enumerating Organizational Units (OUs)

### Retrieve All OUs

```powershell
Get-DomainOU
```

### Retrieve Only OU Names

```powershell
Get-DomainOU | Select -ExpandProperty Name
```

### Example OUs

```text
Domain Controllers
StudentMachines
Applocked
Servers
DevOps
```

These Organizational Units provide immediate visibility into how the environment is segmented and managed.

---

## Identifying Assets Inside the DevOps OU

Retrieve the Distinguished Name:

```powershell
(Get-DomainOU -Identity DevOps).distinguishedname
```

Enumerate computers inside the OU:

```powershell
(Get-DomainOU -Identity DevOps).distinguishedname | %{
    Get-DomainComputer -SearchBase $_
}
```

### Results

```text
DCORP-CI
```

This confirms that the Continuous Integration server resides inside the DevOps administrative boundary.

---

## Enumerating Group Policy Objects (GPOs)

Group Policy Objects define security settings, software deployment configurations, user restrictions, and system behavior.

### Retrieve All GPOs

```powershell
Get-DomainGPO
```

### Identify Policies Linked to the DevOps OU

```powershell
(Get-DomainOU -Identity DevOps).gplink
```

### Retrieve Detailed Information

```powershell
Get-DomainGPO -Identity "{GUID}"
```

### Example Policies

```text
Default Domain Policy
DevOps Policy
```

---

## Enumerating ACLs

ACLs determine who can control, modify, or manage Active Directory objects.

### Retrieve ACLs

```powershell
Get-DomainObjectAcl -Identity "Domain Admins" -ResolveGUIDs
```

### Find Interesting ACLs

```powershell
Find-InterestingDomainAcl -ResolveGUIDs
```

### Interesting Permissions

```text
GenericAll
GenericWrite
WriteDACL
WriteOwner
Delegated Control
Object Ownership
```

ACL analysis frequently uncovers hidden privilege escalation paths that traditional group membership analysis cannot reveal.

---

## Enumerating SMB Shares

File shares frequently contain:

* Configuration files
* Deployment scripts
* Credentials
* Backups
* Writable directories

### Using PowerHuntShares

```powershell
Import-Module C:\AD\Tools\PowerHuntShares.psm1

Invoke-HuntSMBShares -NoPing `
-OutputDirectory C:\AD\Tools\ `
-HostList C:\AD\Tools\servers.txt
```

### Example Shares

```text
ADMIN$
C$
studentshare2
AI
```

A particularly interesting finding was the **AI** share hosted on **dcorp-ci**, where broad write permissions were observed.

---

## Enumerating Domain Trusts

Modern enterprises frequently contain multiple domains and forests connected through trust relationships.

### Using PowerView

```powershell
Get-DomainTrust
```

### Using the Active Directory Module

```powershell
Get-ADTrust -Filter *
```

### Example Trusts

```text
moneycorp.local
us.dollarcorp.moneycorp.local
eurocorp.local
```

Trust relationships reveal how authentication flows between domains and often become critical components of enterprise attack paths.

---

## BloodHound Analysis

While individual enumeration commands provide valuable information, BloodHound combines collected data into a visual graph.

### Collect Data with SharpHound

```powershell
SharpHound.exe --collectionmethods Group,GPOLocalGroup,Session,Trusts,ACL,Container,ObjectProps,SPNTargets --excludedcs
```

### Areas of Analysis

* Shortest Paths to Domain Admins
* Local Administrative Rights
* Group Membership Chains
* ACL-Based Privilege Escalation
* Object Control Relationships
* Session Enumeration
* Trust Relationships

BloodHound transforms raw Active Directory data into actionable attack paths, making privilege relationships significantly easier to understand.

---

## Building the Domain Map

```text
Users
 ↓
Computers
 ↓
Groups
 ↓
Organizational Units
 ↓
Group Policies
 ↓
ACL Relationships
 ↓
SMB Shares
 ↓
Trust Relationships
 ↓
BloodHound Analysis
 ↓
Potential Attack Paths
```

Each piece of information contributes to a larger understanding of how the environment is structured, who controls critical assets, and where privilege boundaries exist.

---

## Conclusion

Active Directory enumeration is far more than executing a collection of PowerShell commands.

The objective is to transform raw directory information into an understanding of the environment's architecture, administrative structure, and privilege relationships.

Every successful Active Directory attack path is built upon information gathered during enumeration.

Whether the goal is privilege escalation, lateral movement, ACL abuse, trust exploitation, or domain dominance, enumeration remains the foundation upon which the entire assessment is built.

**The better the enumeration, the clearer the attack path becomes.**
