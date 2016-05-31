# Contributing to BCDevExchange-app

## Issue Contributions

When opening new issues or commenting on existing issues on this repository
please make sure discussions are related to concrete technical issues with BCDevExchange-app application.

Discussion of non-technical topics including subjects like intellectual
property, trademark and high level project questions should move to the
[Our-Project-Docs](https://github.com/BCDevExchange/Our-Project-Docs)
instead.

## Pay for pull
We are using a "pay for pull" model for some of the issues in this repository. For issues labelled with a "Help Wanted" AND a "$ Amount" we will pay a flat dollar amount if we merge your contribution. 

Please read the [Rapid Adoption Guide](https://github.com/BCDevExchange/rapid-adoption/wiki) for everything you need to know to participate in a Pay for Pull.

For your pull request to be considered for payment, you must include a copy of the Terms completed with your information and a PayPal email link in the comments section of the of the pull request. Please read the Pay for Pull [Terms](https://github.com/BCDevExchange/BCDevExchange-app/blob/master/TERMS.md). 

## Code Contributions

Government employees, public and members of the private sector are encouraged to contribute to the repository by **forking and submitting a pull request**. 

(If you are new to GitHub, you might start with a [basic tutorial](https://help.github.com/articles/set-up-git) and  check out a more detailed guide to [pull requests](https://help.github.com/articles/using-pull-requests/).)

Pull requests will be evaluated by the repository guardians on a schedule and if deemed beneficial will be committed to the master.

All contributors retain the original copyright to their stuff, but by contributing to this project, you grant a world-wide, royalty-free, perpetual, irrevocable, non-exclusive, transferable license to all users **under the terms of the license under which this project is distributed.**


This document will guide you through the contribution process.

### Step 1: Fork

Fork the project [on GitHub](https://github.com/BCDevExchange/BCDevExchange-app) and check out your
copy locally.

```text
$ git clone git@github.com:username/BCDevExchange-app.git
$ cd BCDevExchange-app
$ git remote add upstream git://github.com/BCDevExchange/BCDevExchange-app.git
```

#### Which branch?

For developing new features and bug fixes, the `master` branch should be pulled
and built upon.

### Step 2: Branch

Create a feature branch and start hacking:

```text
$ git checkout -b my-feature-branch -t origin/master
```

### Step 3: Commit

Make sure git knows your name and email address:

```text
$ git config --global user.name "J. Random User"
$ git config --global user.email "j.random.user@example.com"
```

Writing good commit logs is important. A commit log should describe what
changed and why. Follow these guidelines when writing one:

1. The first line should be 50 characters or less and contain a short
   description of the change.
2. Keep the second line blank.
3. Wrap all other lines at 72 columns.

A good commit log can look something like this:

```
explaining the commit in one line

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc. etc.

The body of the commit message can be several paragraphs, and
please do proper word-wrap and keep columns shorter than about
72 characters or so. That way `git log` will show things
nicely even when it is indented.
```

The header line should be meaningful; it is what other people see when they
run `git shortlog` or `git log --oneline`.

### Step 4: Rebase

Use `git rebase` (not `git merge`) to sync your work from time to time.

```text
$ git fetch upstream
$ git rebase upstream/master
```

### Step 5: Test

Bug fixes and features **should come with at least unit tests**. Add your unit tests in files with `.spec.js` suffix in the
same directory as source. Look at other tests to see how they should be
structured (license boilerplate, common includes, etc.). Then run

```text
grunt test
```

Make sure above command succeed.

### Step 6: Push

```text
$ git push origin my-feature-branch
```

Go to https://github.com/yourusername/BCDevExchange-app and select your feature branch.
Click the 'Pull Request' button and fill out the form.

Pull requests are usually reviewed within a few days. If there are comments
to address, apply your changes in a separate commit and push that to your
feature branch. Post a comment in the pull request afterwards; GitHub does
not send out notifications when you add commits.
