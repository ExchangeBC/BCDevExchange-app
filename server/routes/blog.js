/*
Copyright 2015 Province of British Columbia

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

'use strict'
var async = require('async')
var request = require('request')
var config = require('config')
var logger = require('../../common/logging.js').logger
var yaml = require('js-yaml')
var crypto = require('crypto')
var clone = require('clone')
var merge = require('merge')
var db = require('../models/db')

module.exports = function (app, db, passport) {

  app.get('/api/blog/', function (req, res) {

    var results = {
  "blog": [
    {
      "title": "From Kelowna to Kamloops – Building the BCDev Community",
      "link": "http://blog.data.gov.bc.ca/2015/06/from-kelowna-to-kamloops-building-the-bcdev-community/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/06/from-kelowna-to-kamloops-building-the-bcdev-community/#comments",
        {
          "__prefix": "slash",
          "__text": "0"
        }
      ],
      "pubDate": "Tue, 23 Jun 2015 16:59:21 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=3120"
      },
      "description": {
        "__cdata": "By Loren Mullane, Community Engagement, BCDevExchange In the early days of the BCDevExchange, we heard a key message from the BC Innovation Council’s (BCIC) experienced technology network: “Don’t build this idea behind a desk in Victoria. Get out and talk to the provincial tech industry.” Driven by this sage advice, we have been testing the [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\">By Loren Mullane, Community Engagement, BCDevExchange</span></p>\r\n<p><span style=\"color: #000000\">In the early days of the <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange</a>, we heard a key message from the <a href=\"http://www.bcic.ca/\">BC Innovation Council’s (BCIC)</a> experienced technology network: “Don’t build this idea behind a desk in Victoria. Get out and talk to the provincial tech industry.”</span></p>\r\n<p><span style=\"color: #000000\">Driven by this sage advice, we have been testing the idea of the BCDevExchange at regular tech meetups around B.C., including stops last month in Kamloops and Kelowna.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Kamloops Innovation Hosted BCDev Meetup May 11th</strong></span></p>\r\n<p><span style=\"color: #000000\">The Kelowna meetup was already planned when the Kamloops tech community caught wind of the BCDevExchange. <a href=\"http://kamloopsinnovation.ca/\">Kamloops Innovation</a>, a tech accelerator in the BCIC network, contacted us via Twitter asking if we would come there, too.</span></p>\r\n<p><span style=\"color: #000000\">The stars aligned and on May 11<sup>th</sup> a meetup hosted by Kamloops Innovation and local entrepreneur <a href=\"https://twitter.com/thejonotron\">Jonathan Bowers</a> saw over 30 people hear BCDev co-lead Peter Watkins talk about a new model of collaboration between government and the tech sector.</span></p>\r\n<p><em><img class=\"alignleft wp-image-3122\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/06/kamloops.png\" alt=\"kamloops\" width=\"630\" height=\"314\" /></em></p>\r\n<p><span style=\"color: #000000\">As at previous meetups, we were grateful to have local tech luminaries tell their stories to help spur discussion. Experienced technologist and Kamloops Innovation executive director <a href=\"http://kamloopsinnovation.ca/?team=dr-lincoln-smith-2\">Lincoln Smith</a> moderated, while <a href=\"https://twitter.com/derikson\">Dan Erickson</a> of <a href=\"http://truvian.com/\">Truvian Labs</a> brought an entrepreneur’s perspective to our panel.</span></p>\r\n<p><span style=\"color: #000000\">Discussion themes that stood out for us included procurement, security and privacy—important considerations when collaborating on technology. The conversation focused on how government reviews, verifies and tests contributions from developers before actually using them. For example, what would the <a href=\"http://www.kamloops.ca/index.shtml\">City of Kamloops</a> need to do before taking code from developers on the internet and running that code against city databases and systems?</span></p>\r\n<p><span style=\"color: #000000\">There was also enthusiasm to engage with the City of Kamloops and to further the discussion locally. Kamloops Innovation scheduled a second <a href=\"http://kamloopsinnovation.ca/event/bc-developers-exchange-part-2/\"> BCDev meetup on June 17th</a> to explore opportunities for collaboration between the City of Kamloops and the local tech community. We will be watching with keen interest, open to contributing where needed.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Accelerate Okanagan Hosted BCDev Meetup May 27th</strong></span></p>\r\n<p><span style=\"color: #000000\">On May 27<sup>th</sup>, we landed in Kelowna for a meetup with over 20 attendees hosted by <a href=\"https://www.accelerateokanagan.com/\">Accelerate Okanagan</a>, another BCIC accelerator.</span></p>\r\n<p><span style=\"color: #000000\">Once again we were thankful for the support of the local tech scene. <a href=\"https://twitter.com/chadkoh?lang=en\">Chad Kohalyk</a>, a technology expert with a deep knowledge of the web and consumer software applications, moderated a panel with open data API builder <a href=\"https://twitter.com/datamase\">Mason Macklem</a> and <a href=\"https://www.accelerateokanagan.com/about/our-team/\">Accelerate Okanagan executive in residence Raghwa Gopal</a>, a serial entrepreneur with 30 years of startup experience</span></p>\r\n<p><span style=\"color: #000000\">A few of the key themes discussed included data quality and access, and municipalities taking the lead to foster a culture of innovation. Also top of mind: safeguarding the intellectual property of entrepreneurs who built IT products and services that leveraged public data, code or APIs.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Get Involved</strong></span></p>\r\n<p><span style=\"color: #000000\">Our engagement with the tech industry around B.C. has provided valuable insight to guide the direction of the BCDevExchange. We welcome any thoughts you have to share. Please post a comment below and check us out in <a href=\"https://github.com/BCDevExchange\">GitHub</a>.</span></p>\r\n<p><span style=\"color: #000000\">Thanks to the host organizers in both communities and all of those who came out to talk about a better way for government and the tech industry to innovate and collaborate.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/06/from-kelowna-to-kamloops-building-the-bcdev-community/feed/"
      }
    },
    {
      "title": "Environmental Reporting BC Participates in Mozilla Science Lab’s Global Sprint",
      "link": "http://blog.data.gov.bc.ca/2015/06/environmental-reporting-bc-participates-in-mozilla-science-labs-global-sprint/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/06/environmental-reporting-bc-participates-in-mozilla-science-labs-global-sprint/#comments",
        {
          "__prefix": "slash",
          "__text": "0"
        }
      ],
      "pubDate": "Tue, 16 Jun 2015 19:10:57 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=3106"
      },
      "description": {
        "__cdata": "Guest post by Andy Teucher, Environmental Reporting BC (@andyteucher) At Environmental Reporting BC, we embrace openness. We share our methods, data and code underlying the Province’s State of the Environment report. We do this so others can replicate and evaluate our work, and to foster collaboration with other scientists inside and outside the public service, [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><em><img class=\"alignright wp-image-3112 size-medium\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/06/globalsprint-300x115.jpg\" alt=\"globalsprint\" width=\"300\" height=\"115\" />Guest post by Andy Teucher, Environmental Reporting BC (<a href=\"https://twitter.com/andyteucher\">@andyteucher</a>)</em></span></p>\r\n<p><span style=\"color: #000000\">At <a href=\"http://www.env.gov.bc.ca/soe/\">Environmental Reporting BC</a>, we embrace openness. We share our methods, data and code underlying the Province’s State of the Environment report. We do this so others can replicate and evaluate our work, and to foster collaboration with other scientists inside and outside the public service, including providing opportunities to contribute if they desire.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Global Sprint for Open Science</strong></span></p>\r\n<p><span style=\"color: #000000\">Last Friday, June 5th was a perfect example of what is possible. I collaborated with members of the broad “open science” community as part of the <a href=\"https://www.mozillascience.org/global-sprint-2015\">Mozilla Science Lab&#8217;s Global Sprint</a> . This was an event organized by the <a href=\"https://www.mozillascience.org/\">Mozilla Science Lab</a>, an organization that is &#8220;helping a global network of researchers, tool developers, librarians and publishers collaborate to further science on the web.&#8221;</span></p>\r\n<p><span style=\"color: #000000\">During the two-day Sprint (similar to a <a href=\"http://en.wikipedia.org/wiki/Hackathon\">hackathon</a>) people from all over the world gathered, both physically and virtually, to work together on software projects to help advance open science and education. There were 30 Sprint sites or ‘hubs’ in 10 different countries across the globe, with over 40 active projects. Check out the complete list of projects, sites, and participants <a href=\"https://etherpad.mozilla.org/sciencelab-2015globalsprint\">here</a>, and a short summary <a href=\"https://www.mozillascience.org/you-did-this-mozilla-science-global-sprint-2015\">here</a>.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Building Open Lesson Plans Using BC Government Data and Code</strong></span></p>\r\n<p><span style=\"color: #000000\">I joined a great group of people at the Vancouver hub hosted at Mozilla by <a href=\"https://www.mozillascience.org/u/billmills\">Bill Mills</a>, community manager at Mozilla Science. There were lots of great projects underway, some of which you can read about in this <a href=\"http://www.tiffanytimbers.com/Coding.html\">post</a> by fellow sprinter Tiffany Timbers. I was part of a small group that took on the task of creating <a href=\"https://github.com/BillMills/BCenviroLessons\">coding lessons with open data from DataBC</a>. Bill Mills and Evan Morien put together a short script on <a href=\"https://github.com/BillMills/BCenviroLessons/blob/master/basic_tidying/basicTidying.R\">basic data tidying in R</a>—free software for data manipulation, calculation and graphical display—using <a href=\"http://catalogue.data.gov.bc.ca/dataset/air-quality-monitoring-raw-hourly-data-and-station-data\">air quality data</a> from DataBC. <a href=\"https://github.com/aammd\">Andrew MacDonald</a> and I developed a lesson on <a href=\"https://github.com/aammd/BCenviroLessons/blob/exploring-data/data_exploration/explore_grizzly_data.md\">data cleaning and visualizing spatial data with R</a>, again using open data from DataBC: Grizzly bear <a href=\"http://catalogue.data.gov.bc.ca/dataset/2012-grizzly-bear-population-estimates\">population estimates</a>, <a href=\"http://catalogue.data.gov.bc.ca/dataset/history-of-grizzly-bear-mortalities\">mortality history</a> and <a href=\"http://catalogue.data.gov.bc.ca/dataset/grizzly-bear-population-units\">spatial population units</a>. The lesson plans we worked on at the Sprint will help people learn and teach some of the tools of open science, such as <a href=\"http://r-project.org\">R</a> and <a href=\"http://github.com\">GitHub</a>.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Policy Innovation Drives Tech Collaboration</strong></span></p>\r\n<p><span style=\"color: #000000\">All of this is possible because organizations, individuals and governments, including the Province of B.C., are providing public access to their digital resources. Environmental Reporting BC makes our data available in the DataBC Data Catalogue under the <a href=\"http://www.data.gov.bc.ca/local/dbc/docs/license/OGL-vbc2.0.pdf\">Open Government License</a>, which allows anybody to use it for their needs with very few limitations. Because of this, members of the Mozilla Science community could freely use the air quality data and grizzly bear data to develop the lesson plans.</span></p>\r\n<p><span style=\"color: #000000\">More recently, the <a href=\"http://bcdevexchange.org\">BC Developers Exchange</a> opened the door to enhanced government transparency and collaboration by getting the <a href=\"http://blog.data.gov.bc.ca/2015/03/the-province-of-bc-on-github/\">Province of B.C.</a> onto <a href=\"https://github.com/bcgov\">GitHub</a>, and allowing us to publish <a href=\"https://github.com/bcgov/EnvReportBC-RepoList\">our own open source code</a> and participate in other open source projects. As a result, I was able to help develop these lessons that anybody can use, contribute to and modify to their own needs. This is just one example of how these tools that we now have at our disposal can help foster collaboration between government and scientists, technologists, industry, academia and the public.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Get Involved</strong></span></p>\r\n<p><span style=\"color: #000000\">We are excited about the opportunities to engage and collaborate. If you are curious about the work we do, or just want to share your thoughts, we want to hear from you. Find us on <a href=\"https://github.com/bcgov/EnvReportBC-RepoList\">GitHub</a>, on Twitter <a href=\"https://twitter.com/EnvReportBC\">@EnvReportBC</a> or by posting a message below on this blog.</span></p>\r\n<p><span style=\"color: #000000\">Many thanks to the Mozilla Science Lab, and Bill Mills in particular, for hosting the event and taking on the B.C. environment data lessons as a Sprint project.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/06/environmental-reporting-bc-participates-in-mozilla-science-labs-global-sprint/feed/"
      }
    },
    {
      "title": "Province’s BC Data Catalogue Code Published in GitHub",
      "link": "http://blog.data.gov.bc.ca/2015/05/provinces-bc-data-catalogue-code-published-in-github/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/05/provinces-bc-data-catalogue-code-published-in-github/#comments",
        {
          "__prefix": "slash",
          "__text": "0"
        }
      ],
      "pubDate": "Wed, 27 May 2015 19:21:53 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=3098"
      },
      "description": {
        "__cdata": "By Greg Lawrance, Metadata &#38; Catalogue Services, DataBC This week we published the code that powers the BC Data Catalogue in the Province of B.C.’s GitHub account. Getting the code into GitHub has been a pathfinder project for the BC Developers’ Exchange (BCDevExchange). We have ‘learned by doing,’ developing new policy innovations to make it [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><em><img class=\"alignright wp-image-3102 size-medium\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/05/CKAN_Logo_full_color-300x102.png\" alt=\"CKAN_Logo_full_color\" width=\"300\" height=\"102\" />By Greg Lawrance, Metadata &amp; Catalogue Services, DataBC</em></span></p>\r\n<p><span style=\"color: #000000\">This week we published the code that powers the <a href=\"http://catalogue.data.gov.bc.ca/dataset?download_audience=Public\">BC Data Catalogue</a> in the <a href=\"https://github.com/bcgov/ckanext-bcgov\">Province of B.C.’s GitHub</a> account.</span></p>\r\n<p><span style=\"color: #000000\">Getting the code into GitHub has been a pathfinder project for the <a href=\"https://bcdevexchange.org/#/home\">BC Developers’ Exchange (BCDevExchange)</a>. We have ‘learned by doing,’ developing new policy innovations to make it possible. In doing so, we have cleared the path for future government open source projects.</span></p>\r\n<p><span style=\"color: #000000\"><strong>What is the BC Data Catalogue?</strong></span></p>\r\n<p><span style=\"color: #000000\">Launched last year, the <a href=\"http://blog.data.gov.bc.ca/2015/02/databcs-new-tip-top-data-stop/\">BC Data Catalogue</a> (BCDC) lists more than 3,500 datasets, applications and APIs, including over 1500 datasets licensed for commercial use under the <a href=\"http://www.data.gov.bc.ca/local/dbc/docs/license/OGL-vbc2.0.pdf\">Open Government License – BC </a>.</span></p>\r\n<p><span style=\"color: #000000\">The BCDC is powered by open source software called <a href=\"http://ckan.org/\">CKAN (Comprehensive Knowledge Archive Network)</a>. Originally developed by the non-profit <a href=\"https://okfn.org/\">Open Knowledge Foundation<u> (OKFN)</u></a> for the Government of the United Kingdom, CKAN has been adopted by governments around the world, including the Government of Canada.</span></p>\r\n<p><span style=\"color: #000000\"><strong>CKAN License </strong></span></p>\r\n<p><span style=\"color: #000000\">The OKFN provides CKAN software under the <a href=\"http://choosealicense.com/licenses/agpl-3.0/\">GNU Affero Public License v3.0</a> (AGPL). Specifically designed to foster collaboration, the AGPL is a ‘copy-left’ or share-a-like license. The license requires those who deploy the software to the web to share their code modifications, revisions and contributions back to the community under the same license terms.</span></p>\r\n<p><span style=\"color: #000000\">Accordingly, we are sharing our CKAN code modifications back to the community via GitHub. Features we have added include a data dictionary that pulls schema descriptions directly from our database, linkages to web mapping applications, and integration of the Government of Canada’s open source Web Experience Toolkit that provides responsive design and multi-lingual and accessibility features. We hope some of the new features developed for the BCDC make their way back into the core code, or are leveraged by other developers.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Why Open Source?</strong></span></p>\r\n<p><span style=\"color: #000000\">Choosing CKAN places the Province in good company. More than <a href=\"http://ckan.org/instances/\">115 governments and institutions around the globe</a> use CKAN for their data catalogues. Because code enhancements are shared, everyone using the software benefits from enhancements made by the community, creating a better product at a lower cost.</span></p>\r\n<p><span style=\"color: #000000\">Community knowledge is another advantage of choosing open source software. We used <a href=\"https://github.com/ckan/ckan\">GitHub</a><u>,</u> <a href=\"https://lists.okfn.org/mailman/listinfo/ckan-dev\">mailing lists</a>, <a href=\"http://irc.lc/oftc/ckan/\">IRC channels</a> and <a href=\"http://stackexchange.com/search?q=ckan\">forums</a><u> to </u>connect with a vibrant community of over 100 CKAN developers around the world. This developer community shared their experiences and advice on how to customize and implement the software to meet the Province’s requirements.</span></p>\r\n<p><span style=\"color: #000000\"><strong>A Pathfinder</strong></span></p>\r\n<p><span style=\"color: #000000\">While the Province regularly uses open source software such as Apache to run web servers and the JQuery JavaScript library to build web-pages, choosing CKAN for the new catalogue is different because the Province will contribute our code modifications back to the CKAN community.</span></p>\r\n<p><span style=\"color: #000000\">To contribute code back required a number of policy innovations including the Province’s entry into GitHub, a move that sets the stage for government to collaborate with developers on future open source projects.</span></p>\r\n<p><span style=\"color: #000000\">We modified contract language to create appropriate intellectual property rights to distribute the code under an open source license and to allow the vendor to work on open source code on behalf of government. These contract innovations can now be used by other B.C. government open source projects.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Get Involved</strong></span></p>\r\n<p><span style=\"color: #000000\">Our next step is to explore how we use the BCDevExchange to expose our backlog of catalogue issues and enhancements so that people interested in helping can pitch in and help us learn to ‘develop in the open.’ Are you one of those people?</span></p>\r\n<p><span style=\"color: #000000\">Do you have opinions on how we can do this?</span></p>\r\n<p><span style=\"color: #000000\">Let us know what you think by posting a comment on this blog.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/05/provinces-bc-data-catalogue-code-published-in-github/feed/"
      }
    },
    {
      "title": "Recap: BCDevExchange Meetup Hosted by ViaTec",
      "link": "http://blog.data.gov.bc.ca/2015/05/recap-bcdevexchange-meetup-hosted-by-viatec/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/05/recap-bcdevexchange-meetup-hosted-by-viatec/#comments",
        {
          "__prefix": "slash",
          "__text": "0"
        }
      ],
      "pubDate": "Tue, 05 May 2015 18:37:21 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=3087"
      },
      "description": {
        "__cdata": "By Loren Mullane, Community Engagement, BCDevExchange A week ago in Victoria, a packed house learned and shared ideas about the BCDevExchange at Fort Tectoria. Hosted and organized by ViaTec, the turnout exceeded expectations with around 50 people in the room. The majority of attendees self-identified as developers, but there was also a solid contingent of entrepreneurs, [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><em>By Loren Mullane, Community Engagement, BCDevExchange</em></span></p>\r\n<p><img class=\"alignright size-medium wp-image-3086\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/05/ViaTec-300x225.jpg\" alt=\"ViaTec\" width=\"300\" height=\"225\" /><span style=\"color: #000000\">A week ago in Victoria, a packed house learned and shared ideas about the <a href=\"https://bcdevexchange.org/\">BCDevExchange</a> at Fort Tectoria.</span></p>\r\n<p><span style=\"color: #000000\">Hosted and organized by <a href=\"http://www.viatec.ca/\">ViaTec</a>, the turnout exceeded expectations with around 50 people in the room. The majority of attendees self-identified as developers, but there was also a solid contingent of entrepreneurs, open data enthusiasts and a handful of public servants.</span></p>\r\n<p><span style=\"color: #000000\"><strong>The BCDevExchange Vision</strong></span></p>\r\n<p><span style=\"color: #000000\">They came to hear the <a href=\"http://blog.data.gov.bc.ca/2015/02/\">vision</a> presented by project co-lead Peter Watkins of a new engagement model between B.C.’s public and tech sectors. This new model would clear the path for entrepreneurs to use B.C. public sector digital resources, such as code or data, and to have their tech innovations adopted back by government. In closing, Watkins summed up that the goal is for B.C. tech customers to take their tech products and services to the international market.</span></p>\r\n<p><strong><span style=\"color: #000000\">What We Heard</span></strong></p>\r\n<p><span style=\"color: #000000\">Following the presentation, there was a panel discussion with plenty of input from the audience. Like the <a href=\"https://www.opendatabc.ca/\">OpenDataBC</a> meetup in Vancouver, we had key players in the Victoria tech scene volunteer to share their insights on our panel. There was founder and CEO of <a href=\"http://www.latitudegeo.com/\">Latitude Geographics</a> Steven Myhill-Jones, entrepreneur and vice president of the non-profit OpenDataBC Kevin McArthur, and Tayo Runsewe of <a href=\"http://www.rkosolutions.com/\">RKO Solutions</a>.</span></p>\r\n<p><span style=\"color: #000000\">The great ideas generated by the panel and audience members at the meetup will help guide the BCDevExchange as we move forward. There is not enough space to capture all of the gems, but here is a small sample of some of the stories and advice that really stood out.</span></p>\r\n<p><span style=\"color: #000000\">Our event moderator, entrepreneur and ViaTec COO Robert Bennett asked the panel to share their experience working with government and public sector digital resources. Myhill-Jones shared his story of growing his GIS mapping technology company from five people with the Province of B.C. as a first customer, to over 75 employees and more than 800 customers around the world. It was a perfect example of what the BCDevExchange wants to create on a repeatable basis.</span></p>\r\n<p><span style=\"color: #000000\">OpenDataBC’s McArthur expressed what a big deal it was that the <a href=\"http://blog.data.gov.bc.ca/2015/03/the-province-of-bc-on-github/\">Province has joined GitHub</a>. He gave us good advice to get a “big project into GitHub and then invite the community to contribute.”</span></p>\r\n<p><span style=\"color: #000000\">We heard a strong message from members of the audience who spoke about the need to get municipalities and other levels of government involved in the BCDevExchange.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Focus on the Business Problem First</strong></span></p>\r\n<p><span style=\"color: #000000\">Another idea that resonated with us came from a member of the panel. Tayo Runsewe stressed the importance of not blindly focusing on the public sector’s digital resources. Instead he advocated we focus on the business problem first, and then try to find digital resources that may help support a technical solution.</span></p>\r\n<p><span style=\"color: #000000\">“Innovation is not just about the app,” Runsewe said. “It’s about how we engage with the public sector and how we engage on business models.”</span></p>\r\n<p><span style=\"color: #000000\">We think this is a key idea. What if the BCDevExchange unearths public sector business problems during what we call the “Discovery” phase long before a prescribed technical solution has been chosen? The BCDevExchange could publish personas, user stories and other artifacts for listed government programs so that entrepreneurs and developers can first understand program mandates and who the programs serve.</span></p>\r\n<p><strong><span style=\"color: #000000\">Get Involved</span></strong></p>\r\n<p><span style=\"color: #000000\">If you have ideas to share on the <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange</a> we would love to hear from you. Post a comment on this blog, or <a href=\"https://github.com/BCDevExchange\">send us an issue in GitHub</a>.</span></p>\r\n<p><span style=\"color: #000000\">A big thank you to everyone who came out and contributed at ViaTec.</span></p>\r\n<p><span style=\"color: #000000\">And stay tuned for news on the next BCDev meetup.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/05/recap-bcdevexchange-meetup-hosted-by-viatec/feed/"
      }
    },
    {
      "title": "Recap: BCDevExchange Meetup Hosted by OpenDataBC",
      "link": "http://blog.data.gov.bc.ca/2015/04/recap-bcdevexchange-meetup-hosted-by-opendatabc/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/04/recap-bcdevexchange-meetup-hosted-by-opendatabc/#comments",
        {
          "__prefix": "slash",
          "__text": "2"
        }
      ],
      "pubDate": "Mon, 20 Apr 2015 20:49:08 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=3071"
      },
      "description": {
        "__cdata": "By Loren Mullane, Community Engagement, BCDevExchange Wednesday night we tested the idea of the BCDevExchange with the tech and startup community in Vancouver. On a night when the Canucks opened the playoffs, over 60 entrepreneurs, developers and open data aficionados congregated to hear about the BCDevExchange at the meetup organized by the non-profit OpenDataBC with [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><em>By Loren Mullane, Community Engagement, BCDevExchange</em></span></p>\r\n<p><span style=\"color: #000000\"><img class=\"alignright size-full wp-image-3081\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/04/bcdev-panel.jpg\" alt=\"bcdev panel\" width=\"306\" height=\"306\" />Wednesday night we tested the idea of the <a href=\"https://bcdevexchange.org/\">BCDevExchange</a> with the tech and startup community in Vancouver.</span></p>\r\n<p><span style=\"color: #000000\">On a night when the Canucks opened the playoffs, over 60 entrepreneurs, developers and open data aficionados congregated to hear about the BCDevExchange at the meetup organized by the non-profit <a href=\"https://www.opendatabc.ca/\">OpenDataBC</a> with support from <a href=\"http://www.pixelcrafters.ca/\">Vancouver Pixel Crafters</a>.</span></p>\r\n<p><span style=\"color: #000000\">Project co-lead Peter Watkins pitched the BCDevExchange as an opportunity to seed business opportunities for the province’s tech sector. This would be done by sharing government’s code, data and APIs, and by adopting innovations from industry back into government.</span></p>\r\n<p><span style=\"color: #000000\">To help us explore the idea, we had tech heavy hitters and experienced users of government’s digital resources present. Our panel moderator was Keith Ippel, the co-founder of the <a href=\"http://spring.is/\">Spring</a>, which helps startups get off the ground. Ippel brings over 15-years experience growing small and large companies such as Hootsuite, Lat49, KPMG and HUB Cycling. On our expert panel we had Mischa Steiner-Jovic, the founder and CEO of <a href=\"http://www.awesense.com/\">Awesense</a>, a company that provides intel on energy losses in their electrical grids to utilities around the world. Steiner-Jovic spoke of the challenge to get access to utility data for his company. The co-founder &amp; CEO of startup <a href=\"http://www.knomos.ca/\">Knomos</a>, Adam LaFrance shared his experience of building a visual legal research tool that leverages the <a href=\"http://www.bclaws.ca/civix/template/complete/api/index.html\">BC Laws API</a>, which is a digital resource licensed by the Province’s Queen’s Printer for commercial use. Entrepreneur and open data leaderHerb Lainchbury of OpenDataBC advocated government continue to unlock valuable data from behind paywalls.</p>\r\n<div id=\"imcontent\" dir=\"ltr\">\r\n<p><span style=\"color: #000000\">The event generated spirited discussion and encouragement for the initial steps the Province is making. The mention of <a href=\"https://github.com/bcgov\">the Province’s entry into GitHub</a> – a key tool the tech sector uses to collaborate on code development – drew a round of applause. At the meetup, entrepreneur Boris Mann put out a call-to-action to the community to show their support by engaging with the <a href=\"https://github.com/BCDevExchange\">BCDevExchange in GitHub</a>.</span></p>\r\n<p><span style=\"color: #000000\">But enough of our observations; <a href=\"https://storify.com/databc/recap-opendatabc-meetup-on-the-bcdevexchange\">check out this Storify</a> we created of some of the tweets by those at the event.</span></p>\r\n<p><span style=\"color: #000000\">And let us know what you think. Post a comment below, or <a href=\"https://github.com/BCDevExchange\">send us an issue in GitHub</a>.</span></p>\r\n<p><span style=\"color: #000000\"><strong>ViaTec Hosts Next Info Session April 28th at Fort Tectoria </strong></span></p>\r\n<p><span style=\"color: #000000\">The next opportunity for B.C.’s tech community to learn about and give feedback on the BCDevExchange is April 28th in Victoria.</span></p>\r\n<p><span style=\"color: #000000\">We are looking forward to input on the BCDevExchange from Victoria’s thriving tech sector. Hosted by <a href=\"http://www.viatec.ca/\">ViaTec</a>, the event will run from 5pm – 7pm at Fort Tectoria. Space is limited so <a href=\"https://www.eventbrite.ca/e/bcdevexchange-info-session-tickets-16602764315\">RSVP</a>.</span></p>\r\n<p><em>Photo credit, Rastin Mehr, <a href=\"https://twitter.com/rastin\">@rastin</a></em></p>\r\n</div>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/04/recap-bcdevexchange-meetup-hosted-by-opendatabc/feed/"
      }
    },
    {
      "title": "BCDevExchange Info Session April 15 in Vancouver",
      "link": "http://blog.data.gov.bc.ca/2015/04/bcdevexchange-info-session-april-15-in-vancouver/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/04/bcdevexchange-info-session-april-15-in-vancouver/#comments",
        {
          "__prefix": "slash",
          "__text": "1"
        }
      ],
      "pubDate": "Fri, 10 Apr 2015 05:35:39 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=3033"
      },
      "description": {
        "__cdata": "By Loren Mullane, Community Engagement, BCDevExchange We will be in Vancouver to talk about the BCDevExchange. The Info Session is part of our commitment to ‘go to the community’ to test the value of the BCDevExchange. Organized by OpenDataBC, the Info Session will be at the Hive on April 15th from 5:30pm to 7:30pm. Plan [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><em>By Loren Mullane, Community Engagement, BCDevExchange</em></span></p>\r\n<p><span style=\"color: #000000\">We will be in Vancouver to talk about the</span> <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange</a><span style=\"color: #000000\">. The Info Session is part of our commitment to ‘go to the community’ to test the value of the BCDevExchange.</span></p>\r\n<p><span style=\"color: #000000\">Organized by</span> <a href=\"https://www.opendatabc.ca/\">OpenDataBC</a><span style=\"color: #000000\">, the Info Session will be at</span> <a href=\"https://www.google.com/maps?f=q&amp;hl=en&amp;q=210+-+128+W+Hastings+St,+Vancouver,+BC,+ca\">the Hive</a> <span style=\"color: #000000\">on April 15<sup>th</sup> from 5:30pm to 7:30pm. Plan to join us and learn more about what we are trying to achieve, and most importantly to contribute your ideas and perspective.</span></p>\r\n<p><span style=\"color: #000000\">Expect a robust discussion on finding new ways for the tech and B.C. public sectors to collaborate on the development of technology products and services. Space is limited, so make sure you</span> <a href=\"http://www.meetup.com/OpenDataBC-Vancouver/events/219372256/\">RSVP</a><span style=\"color: #000000\">.</span></p>\r\n<p><span style=\"color: #000000\">And stay tuned for more Info Sessions, with Victoria and Kelowna as potential stops.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Looking Back on the BCDevExchange Discovery Day</strong></span></p>\r\n<p><span style=\"color: #000000\">On March 24-25<sup>th</sup> we were in Vancouver for a</span> <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange</a> <span style=\"color: #000000\">Discovery Day that focussed on how we can use technology to support public engagement in the Province. The event featured the</span> <a href=\"http://www.bclaws.ca/civix/template/complete/api/index.html\">BC Laws API</a> <span style=\"color: #000000\">and the Province of B.C.’s use of WordPress and other technology to engage citizens, with the</span> <a href=\"http://engage.gov.bc.ca/liquorpolicyreview/\">BC Liquor Policy Review</a> <span style=\"color: #000000\">a prominent example.</span></p>\r\n<p><span style=\"color: #000000\">As the featured digital resource, the BC Laws API demonstrated the possibilities for leveraging technology to engage citizens. A “wow” moment for the audience of public engagement professionals and technologists was getting a glimpse at the work that BC-based start-up</span> <a href=\"http://www.knomos.ca/\">Knomos</a> <span style=\"color: #000000\">is doing using the BC Laws API for visualizing and navigating legislation.</span></p>\r\n<p><a href=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/04/IMG_20150324_134303.jpg\"><img class=\"alignright size-full wp-image-3058\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/04/IMG_20150324_134303.jpg\" alt=\"IMG_20150324_134303\" width=\"640\" height=\"360\" /></a></p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p><span style=\"color: #000000\">What did we learn?</span></p>\r\n<ul>\r\n<li><span style=\"color: #000000\">The organizations represented at the event and the number of attendees signaled demand and interest in the opportunity to use public sector digital resources.</span></li>\r\n</ul>\r\n<ul>\r\n<li><span style=\"color: #000000\">Participants identified shared business needs and specific opportunities to collaborate, supporting the premise of the BCDevExchange.</span></li>\r\n</ul>\r\n<ul>\r\n<li><span style=\"color: #000000\">The people with business problems don’t necessarily speak the same language as the technologist with solutions. The BCDevExchange needs to find efficient ways to bridge the language gap.</span></li>\r\n</ul>\r\n<p><span style=\"color: #000000\">More Discovery Days are in the works. They are an opportunity to bring together a mix of public sector innovators, tech entrepreneurs and start-ups to explore the potential for digital resources, business needs and opportunities for innovation.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Co-design Community Revs Up</strong></span></p>\r\n<p><span style=\"color: #000000\">In keeping with</span> <a href=\"http://blog.data.gov.bc.ca/2015/03/bcdevexchange-adopts-agile/\">our adoption of Agile Methodology</a><span style=\"color: #000000\">, we also held our first co-design session on March 23<sup>rd</sup> in Victoria. Roughly 25 developers, entrepreneurs and public sector innovators participated.  In a lively and interactive workshop, participants provided valuable input into mapping the future of the BCDevExchange. Participants were particularly interested in the sharing of public sector digital resources and new ways to incentivize contributions, including code, from developers outside government. <a style=\"color: #000000\" href=\"http://blog.data.gov.bc.ca/2015/03/the-province-of-bc-on-github/\">Our entry into GitHub</a> represents the initial step to explore such collaborations.</span></p>\r\n<p><span style=\"color: #000000\"><img class=\"alignright size-full wp-image-3040\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/04/IMG_0743_poster-e1428641660303.jpg\" alt=\"IMG_0743_poster\" width=\"640\" height=\"480\" /></p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p><span style=\"color: #000000\">If you are developer or designer in Vancouver and Kelowna, let us know if you are interested in in participating in a co-design session.  We intend to come to you in the coming months.</span></p>\r\n<p><span style=\"color: #000000\">Have questions about the</span> <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange</a><span style=\"color: #000000\">? <a href=\"mailto:data@gov.bc.ca\">Email us</a> or post a comment below. We would love to hear from you.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/04/bcdevexchange-info-session-april-15-in-vancouver/feed/"
      }
    },
    {
      "title": "The BCDevExchange Evolves",
      "link": "http://blog.data.gov.bc.ca/2015/04/the-bcdevexchange-evolves/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/04/the-bcdevexchange-evolves/#comments",
        {
          "__prefix": "slash",
          "__text": "0"
        }
      ],
      "pubDate": "Wed, 01 Apr 2015 20:27:20 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=3019"
      },
      "description": {
        "__cdata": "By Alex White, Business Analyst, BC Developers&#8217; Exchange We’ve rolled out a few enhancements to BCDevExchange.org to better illustrate the direction of the project. We’ve added a search function for Resources and Projects, and we’ve taken the covers off a Labs concept. This is the first iteration of these ideas, and we expect they will [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><em><img class=\"alignright size-medium wp-image-3027\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/04/4370250151_af61ba5da0_o-300x168.png\" alt=\"4370250151_af61ba5da0_o\" width=\"300\" height=\"168\" />By Alex White, Business Analyst, BC Developers&#8217; Exchange</em></span></p>\r\n<p><span style=\"color: #000000\">We’ve rolled out a few enhancements to</span> <a href=\"https://bcdevexchange.org/\">BCDevExchange.org</a> <span style=\"color: #000000\">to better illustrate the direction of the project. We’ve added a search function for</span> <a href=\"https://bcdevexchange.org/#/resources\">Resources</a> <span style=\"color: #000000\">and</span> <a href=\"https://bcdevexchange.org/#/projects\">Projects</a><span style=\"color: #000000\">, and we’ve taken the covers off a <a href=\"https://bcdevexchange.org/#/lab\">Labs</a> concept. This is the first iteration of these ideas, and we expect they will further evolve.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Discover Digital Resources</strong></span></p>\r\n<p><span style=\"color: #000000\">We’ve heard from our engagement activities that people are sharing digital resources &#8211; code, APIs, applications and datasets &#8211; and we think that’s great. We’ve also heard that digital resources are often hard to find, which we think is bad. To help address this, we’ve added a Resource Search function on <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange.org</a> that can search across different sources for digital resources, including both</span> <a href=\"http://ckan.org/\">Comprehensive Knowledge Archive Network <span style=\"color: #000000\">(CKAN)</span></a><span style=\"color: #000000\"> data catalogues and</span> <a href=\"https://github.com/\">GitHub</a> <span style=\"color: #000000\">code repositories. This sets the groundwork for an easier way to discover digital resources.</span></p>\r\n<p><span style=\"color: #000000\">For background, CKAN is open-source data cataloguing software used by DataBC, the <a href=\"http://data.surrey.ca/\">City of Surrey</a>, and many national governments, including <a href=\"http://open.canada.ca/data/en/dataset\">Canada</a>. CKAN has an API that lets us search and show digital resources on the BCDevExchange. The biggest code sharing community, GitHub has over 17 million code repositories, or repos.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Learn about Projects and Backlogs</strong></span></p>\r\n<p><span style=\"color: #000000\">In support of our principles of open development and co-creation, we are posting Projects on BCDevExchange with openly visible and accessible development backlogs. We are using GitHub repos to hold projects with one repo per project, and the repo’s issue list as its backlog. A search function has been added to<a href=\"https://bcdevexchange.org/#/home\"> BCDevExchange.org</a> which calls a GitHub API and returns all repos tagged as projects. We want to make it easy for you to see what the dev team is up to and to share your ideas or suggestions through GitHub issues.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Experiment in the Labs</strong></span></p>\r\n<p><span style=\"color: #000000\">We have created a separate Labs area accessible from <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange.org</a>. The thinking is for Labs to be a place to develop and share projects and ideas in an open and safe environment; where people know to expect things to be under construction and in a less than perfect, non-production state. In addition to providing a safe place to experiment, we are investigating different tools we can provide or recommend to members to help encourage their participation in the Labs. Right now, BCDevExchange is the primary occupant of the Lab, with sandbox (testing environment) versions of CKAN and <a href=\"http://wso2.com/api-management/\">WSO2 API Manager</a> that support the <a href=\"https://github.com/BCDevExchange/BCLaws-API-Management\">BCLaws API Management project</a>. We are working to bring other projects into the Labs in the coming months, which will help us figure out exactly how we can best meet the needs of the wider community. Expect the Labs to change and evolve accordingly.</span></p>\r\n<p><span style=\"color: #000000\"><strong>What now?</strong></span></p>\r\n<p><span style=\"color: #000000\">Do you have a CKAN catalogue, or code in GitHub you’d like to share? <a href=\"mailto:Data@gov.bc.ca?subject=Feedback on BCDevExchange\">Contact us</a> about how to get your digital resources listed on the <a href=\"https://bcdevexchange.org/#/home\">BCDevExchange</a>.</span></p>\r\n<p><span style=\"color: #000000\">Interested in helping to shape the evolution of BCDevExchange? <a href=\"https://github.com/BCDevExchange\">Find us on GitHub</a>, and check out our project repos and backlogs.</span></p>\r\n<p><span style=\"color: #000000\">Come check out the <a href=\"https://bcdevexchange.org/#/lab\">Labs</a>, and share your thoughts about how the concept could evolve.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/04/the-bcdevexchange-evolves/feed/"
      }
    },
    {
      "title": "Charting a New Path – Environmental Reporting BC and Code Sharing",
      "link": "http://blog.data.gov.bc.ca/2015/03/charting-a-new-path-environmental-reporting-bc-and-code-sharing/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/03/charting-a-new-path-environmental-reporting-bc-and-code-sharing/#comments",
        {
          "__prefix": "slash",
          "__text": "0"
        }
      ],
      "pubDate": "Mon, 16 Mar 2015 18:49:13 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Wrate, David GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Open Data"
        },
        {
          "__cdata": "Uncategorized"
        },
        {
          "__cdata": "code"
        },
        {
          "__cdata": "data"
        },
        {
          "__cdata": "github"
        },
        {
          "__cdata": "open data"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=2985"
      },
      "description": {
        "__cdata": "By Stephanie Hazlitt and Andy Teucher, the Environmental Reporting BC team Environmental Reporting BC has published code in GitHub. We are a pathfinder project in the BCDevExchange, an experiment led by the Province of B.C. intended to create space for collaboration and innovation between tech entrepreneurs and British Columbia&#8217;s public sector. What Are We Publishing? [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><a href=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/03/environmental-protection-326923_1280.jpg\"><img class=\"alignright wp-image-3007 size-medium\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/03/environmental-protection-326923_1280-300x199.jpg\" alt=\"Tree in a globe\" width=\"300\" height=\"199\" /></a>By Stephanie Hazlitt and Andy Teucher, the Environmental Reporting BC team</span></p>\r\n<p><span style=\"color: #000000\"><a href=\"http://www.env.gov.bc.ca/soe/\">Environmental Reporting BC</a> has published code in GitHub. We are a pathfinder project in the <a href=\"http://bcdevexchange.org/#/home\">BCDevExchange</a>, an experiment led by the Province of B.C. intended to create space for collaboration and innovation between tech entrepreneurs and British Columbia&#8217;s public sector.</span></p>\r\n<p><span style=\"color: #000000\"><strong>What Are We Publishing?</strong></span><br />\r\n<span style=\"color: #000000\"><a href=\"http://www.env.gov.bc.ca/soe/\"> Environmental Reporting BC</a> is the Province’s approach to state of the environment reporting, sharing data, analysis and information on key environmental <a href=\"http://www.env.gov.bc.ca/soe/indicators\">topics</a>. Our web-based model strives to serve the varied needs of our <a href=\"http://blog.data.gov.bc.ca/2013/03/environmental-reporting-bc-engages-citizens-on-the-environment/\">audiences</a>, provide timely, open, and dynamic reports on the environment that are easy to access and understand.</span></p>\r\n<p><span style=\"color: #000000\"> We are moving our code – the scripts we write to get, prepare, analyse and present environmental data and information into the <a href=\"https://github.com/bcgov\">Province’s GitHub space</a>. GitHub is an online collaborative platform widely used to share and collaborate on code and other content. The Province of B.C. is a newcomer to <a href=\"https://github.com/bcgov\">GitHub</a> but as a start, you will find an <a href=\"http://www.r-project.org/\">R</a> <a href=\"https://github.com/bcgov/bcgroundwater/\">package</a> and the <a href=\"https://github.com/bcgov/groundwater_levels\">analysis code</a></span> <span style=\"color: #000000\">behind our ‘</span><a href=\"http://www.env.gov.bc.ca/soe/indicators/water/wells/index.html\">Long-term Trends in Groundwater Levels in B.C</a><span style=\"color: #000000\">.’</span> <span style=\"color: #000000\">indicator. Expect more to come.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Pathfinder Project</strong></span><br />\r\n<span style=\"color: #000000\"> Environmental Reporting BC and the BCDevExchange share key principles, like <a href=\"http://www.env.gov.bc.ca/soe/about/\">openness</a>, <a href=\"http://blog.data.gov.bc.ca/2015/03/how-to-deal-with-not-knowing-bcdevexchanges-4-principles/\">collaboration</a>, and <a href=\"http://blog.data.gov.bc.ca/2015/03/how-to-deal-with-not-knowing-bcdevexchanges-4-principles/\">learning by doing</a>. In the spirit of these principles and continuous experimentation, Environmental Reporting BC is charting a new path as a pathfinder project of the BCDevExchange. The goal is to share our experience with other public sector organizations interested in moving into this space.</span></p>\r\n<p><span style=\"color: #000000\"> Since its inception, Environmental Reporting BC has embraced openness. We <a href=\"http://www.env.gov.bc.ca/soe/indicators/plants-and-animals/native-vertebrate-species_methods.html\">share our methods</a>. and make the <a href=\"http://catalogue.data.gov.bc.ca/dataset?q=%22environmental+reporting%22&amp;download_audience=Public&amp;sort=score+desc%2C+record_publish_date+desc\">data underlying our analyses</a> available on DataBC under the <a href=\"http://www.data.gov.bc.ca/local/dbc/docs/license/OGL-vbc2.0.pdf\">Open Government License – British Columbia</a>. This includes the <a href=\"http://catalogue.data.gov.bc.ca/dataset?tags=Environmental+Reporting+BC\">groundwater data</a> used with the R package in GitHub. For us, making the R package and analysis code available is a natural continuation of our commitment to openness and transparency, a ‘fork’ in the same road that will hopefully lead to more opportunities for collaboration and two-way conversations.</span></p>\r\n<p><span style=\"color: #000000\"><strong>More to Come</strong></span><br />\r\n<span style=\"color: #000000\"> Stay tuned to this space; Environmental Reporting BC will be blogging as we move more of our code into the Provinces&#8217; <a style=\"color: #000000\" href=\"https://github.com/bcgov\">GitHub</a> space. You will see more R packages, our code-based tools, and more analysis code supporting topics like air quality, or the <a href=\"http://www.env.gov.bc.ca/soe/indicators/plants-and-animals/native-vertebrate-species.html\">status of animals in British Columbia</a> and climate change. Our code-sharing vision is to promote increased transparency and collaboration for environmental reporting, across the province and beyond.</span></p>\r\n<p><span style=\"color: #000000\">If you have feedback on this new experiment, or thoughts to share, please leave us a comment. We are listening. And please, fork us on GitHub. You can also reach us on Twitter at <a href=\"https://twitter.com/envreportbc\">@EnvReportBC</a>.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/03/charting-a-new-path-environmental-reporting-bc-and-code-sharing/feed/"
      }
    },
    {
      "title": "BCDevExchange Adopts Agile",
      "link": "http://blog.data.gov.bc.ca/2015/03/bcdevexchange-adopts-agile/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/03/bcdevexchange-adopts-agile/#comments",
        {
          "__prefix": "slash",
          "__text": "1"
        }
      ],
      "pubDate": "Fri, 13 Mar 2015 21:45:00 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Wrate, David GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=2996"
      },
      "description": {
        "__cdata": "By Paul Roberts, Product Owner &#8211; The BCDevExchange Team The BCDevExchange development team has adopted the Agile Methodology and Lean startup theory. To better guide our development work we are inviting users to join in with us and become part of the BCDevExchange community. Getting Agile We empowered the development team to work in 2-week [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\"><a href=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/03/Scrum_task_board.jpg\"><img class=\"alignright wp-image-3001 size-medium\" src=\"http://blog.data.gov.bc.ca/wp-content/uploads/2015/03/Scrum_task_board-224x300.jpg\" alt=\"Scrum_task_board\" width=\"224\" height=\"300\" /></a>By Paul Roberts, Product Owner &#8211; The BCDevExchange Team</span></p>\r\n<p><span style=\"color: #000000\">The <a href=\"http://bcdevexchange.org/#/home\">BCDevExchange</a> development team has adopted the Agile Methodology and Lean startup theory. To better guide our development work we are inviting users to join in with us and become part of the BCDevExchange community.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Getting Agile</strong></span></p>\r\n<p><span style=\"color: #000000\">We empowered the development team to work in 2-week sprints, problem solving and delivering software features that users can test. These software features will be minimum viable products – just enough working software for users to test whether they like it.</span></p>\r\n<p><span style=\"color: #000000\"> We believe it’s better to ‘fail fast’ and that user experience (UX) research and design is fundamental to getting things right. We want the UX work to provide quality assurance up-front and be timed to feed into the development team’s sprint planning sessions.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Hearing the User</strong></span><br />\r\n<span style=\"color: #000000\"> We are initiating the formation of two user groups to give us feedback at the tactical level. One group will help us imagine and design the future of the product. Our plan is to convene this group and workshop the construction of a product backlog to help us imagine what the product will look like in six months.</span></p>\r\n<p><span style=\"color: #000000\"> We are looking for interested people who can contribute to the future design and who will grow with us as the BCDevExchange matures. For optimal use of their time, we figure the community needs to come together every three months or so.</span></p>\r\n<p><span style=\"color: #000000\"> A second group is intended to evaluate what we’ve done and provide user experience feedback on newly-minted software features created by the BCDevExchange development team. They will test the specifics of what we have developed, and let us refine the product we are making.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Get Involved</strong></span><br />\r\n<span style=\"color: #000000\"> How can you get involved?</span></p>\r\n<p><span style=\"color: #000000\"> We are looking for developers and UX designers to join and help us evaluate work on-the-fly housed in GitHub and on the software features within the BCDevExchange website. We’ll be looking to form this community in the ensuing few weeks. <a href=\"mailto:data@gov.bc.ca\">Contact us</a> if you are interested.</span></p>\r\n<p><span style=\"color: #000000\"> And please tell us your thoughts by leaving a comment on the blog. Does this agile approach resonate?</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/03/bcdevexchange-adopts-agile/feed/"
      }
    },
    {
      "title": "The Province of BC on GitHub",
      "link": "http://blog.data.gov.bc.ca/2015/03/the-province-of-bc-on-github/",
      "comments": [
        "http://blog.data.gov.bc.ca/2015/03/the-province-of-bc-on-github/#comments",
        {
          "__prefix": "slash",
          "__text": "1"
        }
      ],
      "pubDate": "Fri, 06 Mar 2015 23:27:38 +0000",
      "creator": {
        "__prefix": "dc",
        "__cdata": "Mullane, Loren GCPE:EX"
      },
      "category": [
        {
          "__cdata": "BCDev"
        },
        {
          "__cdata": "Uncategorized"
        }
      ],
      "guid": {
        "_isPermaLink": "false",
        "__text": "http://blog.data.gov.bc.ca/?p=2972"
      },
      "description": {
        "__cdata": "By Todd Wilson, Senior Enterprise Architect, Office of the Chief Information Officer The Province of British Columbia has joined GitHub as part of the BCDevExchange experiment. The Province has set up an organisation on GitHub where all of the Province’s open collaboration will be housed. If you don’t know it, no worries—GitHub is a social software [&#8230;]"
      },
      "encoded": {
        "__prefix": "content",
        "__cdata": "<p><span style=\"color: #000000\">By Todd Wilson, Senior Enterprise Architect, Office of the Chief Information Officer</span></p>\r\n<p><span style=\"color: #000000\">The Province of British Columbia has joined <a href=\"https://github.com/\">GitHub</a> as part of the <a href=\"http://bcdevexchange.org/#/home\">BCDevExchange</a> experiment. The Province has set up an <a href=\"https://github.com/bcgov\">organisation on GitHub</a> where all of the Province’s open collaboration will be housed. If you don’t know it, no worries—GitHub is a social software coding service that lets people keep track of different versions of what they are making, typically software code. It supports comments, document management, and feature requests.</span></p>\r\n<p><span style=\"color: #000000\"><strong>T</strong><strong>ooling up for Open Collaboration</strong></span></p>\r\n<p><span style=\"color: #000000\">GitHub is the most widely-used community for open collaboration on source code files and boasts a community of nearly four million people sharing code in millions of repositories.</span></p>\r\n<p><span style=\"color: #000000\">We are going to where the community is—but our start with GitHub is really modest. In the spirit of experimentation, it’s going to be a tool and a practice we are going to need to learn about.</span></p>\r\n<p><span style=\"color: #000000\">The kind of open collaboration GitHub is designed to foster can be really powerful. Most of us have learned the basics of “share and share alike” and “many hands make light work.”  Recognizing these two really simple ideas work phenomenally well together, the tech sector has used open collaboration on technology projects since the very first days of the internet.</span></p>\r\n<p><span style=\"color: #000000\">The potential to bring the skills and ideas of private sector companies, provincial government ministries, individual developers and broader public sector bodies like Crown Corporations and municipalities make it a great way to test the ideas behind the</span> <span style=\"color: #000000\"><a href=\"http://blog.data.gov.bc.ca/2015/02/introducing-the-bc-developers-exchange/\">BCDevExchange experiment</a>—particularly our ability to not only share code, but accept changes from others.</span></p>\r\n<p><span style=\"color: #000000\"><strong>Baby steps</strong></span></p>\r\n<p><span style=\"color: #000000\">We are at the early stages of operating in this space, so we are moving into GitHub step-by-step. For now, you won’t see a rush of new projects in our repositories. There’s a lot to think about—from managing intellectual property to applying the <a href=\"http://www.gov.bc.ca/citz/citizens_engagement/some_guidelines_master.pdf\">B.C. Social Media Guidelines</a> and providing guidance to our employees about using the tool.</span></p>\r\n<p><span style=\"color: #000000\">In the meantime, you are invited to check out what we have on GitHub so far. The BCDevExchange will learn by doing, so we are working on some early adopter or “pathfinder” projects that will teach us about sharing public sector code and accepting contributions back from those outside government. The BCDevExchange experiment is one of these pathfinders and is available at:</span> <a href=\"https://github.com/BCDevExchange\">https://GitHub.com/BCDevExchange</a><span style=\"color: #000000\">. We expect to pick up speed, adding more pathfinders as we go. If your B.C. public sector organization has a potential pathfinder project, <a href=\"mailto:Data@gov.bc.ca\">we</a></span><a href=\"mailto:Data@gov.bc.ca\"> would love to hear from you.</a></p>\r\n<p><span style=\"color: #000000\">This is a very exciting time as we apply the spirit of open collaboration to public sector technology development.</span></p>\r\n<p><span style=\"color: #000000\">If you have thoughts to share, please leave us a comment.</span></p>\r\n"
      },
      "commentRss": {
        "__prefix": "wfw",
        "__text": "http://blog.data.gov.bc.ca/2015/03/the-province-of-bc-on-github/feed/"
      }
    },
    {
      "title": "Introducing the BC Developers’ Exchange",
      "pubDate": "Wed, 25 Feb 2015 00:00:00 +0000",
      "link": "https://blog.data.gov.bc.ca/2015/02/introducing-the-bc-developers-exchange/",
      "description": {
        "__cdata": "By Peter Watkins, Executive Director, Commercialization Initiatives, Strategic Initiatives and Partnerships Division, Ministry of Technology, Innovation and Citizens’ Services What if brilliant developers could use real-time data feeds to create mobile phone transit apps to locate moving buses? The solution would be a win-win-win. Public transit organizations [&#8230;]"
      }
    },
    {
      "title": "How to deal with not knowing – BCDevExchange’s 4 principles",
      "pubDate": "Mon, 02 Mar 2015 00:00:00 +0000",
      "link": "https://blog.data.gov.bc.ca/2015/03/how-to-deal-with-not-knowing-bcdevexchanges-4-principles/",
      "description": {
        "__cdata": "By David Hume, Executive Director, Citizen Engagement, One of the reasons it’s exciting to be part of the BCDevExchange project is that it’s a journey—we know where we want to go, but what we find along the way is still to be discovered. As open and full of possibility as that sounds (and is), the rub comes when decisions need to be made about options that [&#8230;]"
      }
    },
    {
      "title": "BCDevExchange 2.0 Release",
      "pubDate": "Mon, 14 Sep 2015 00:00:00 +0000",
      "link": "http://blog.data.gov.bc.ca/2015/09/bcdevexchange-2-0-release/",
      "description": {
        "__cdata": "By Loren Mullane, Community Engagement, BCDevExchange Today, we launched a new iteration of the BCDevExchange website with new features to help B.C.’s public and tech sectors collaborate and experiment together. We believe collaboration between B.C.’s public and tech sector is a win-win – it will lead to better information technology products and services, which can [&#8230;]"
      }
    },
    {
      "title": "GitHub Harnesses the Power of the Crowd",
      "pubDate": "Wed, 16 Sep 2015 00:00:00 +0000",
      "link": "http://blog.data.gov.bc.ca/2015/09/github-harnesses-the-power-of-the-crowd/",
      "description": {
        "__cdata": "By Loren Mullane, Community Engagement, BCDevExchange As any coder will tell you, sometimes code breaks. Normally, fixing broken code falls on the original coder who needs to carve out time in their busy schedule. A fix can take time depending on how much other work a coder has. But there is another way. Enter GitHub, the popular online code sharing community. Operating [&#8230;]"
      }
    }
  ]
};
    res.send(results);

  })
}
