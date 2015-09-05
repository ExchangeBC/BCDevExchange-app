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

var async = require('async')
var request = require('request')
var config = require('config')
var logger = require('../../common/logging.js').logger
var projects = require('./projects')
var resources = require('./resources')

var Twitter      = require('twitter')
var twitter_text = require('twitter-text')

module.exports = function(app, db, passport) {
    app.get('/numbers/:source?', function (req, res) {

        if (req.params.source) {
            if (req.params.source === 'resources') {
                resources.getResourcesFromArray(config.catalogues, function (result) {
                    res.send({"resources": result.length})
                }, function (error) {
                    res.status(500)
                })
            }
            else if (req.params.source === 'projects') {
                projects.getProjectsFromArray(config.projects, function (result) {
                    res.send({"projects": result.length})
                }, function (error) {
                    res.status(500)
                })
            }
            else if (req.params.source === 'accounts') {
                db.countGitHubAccounts(function (err, result) {
                    if (err) {
                        res.status(500)
                    }
                    else {
                        res.send(result)
                    }
                })
            }

        }
        else {
            async.parallel({
                githubAccounts: function (callback) {
                    db.countGitHubAccounts(callback)
                },

                resources: function (callback) {
                    resources.getResourcesFromArray(config.catalogues, function (result) {
                        callback(null, result.length)
                    }, function (error) {
                        callback(error, null)
                    })
                },
                projects: function (callback) {
                    projects.getProjectsFromArray(config.projects, function (result) {
                        callback(null, result.length)
                    }, function (error) {
                        callback(error, null)
                    })
                },
                bcdevx: function(callback) {
                    getGithubOrgData('BCDevExchange', callback)
                },
                bcgov: function(callback) {
                    getGithubOrgData('BCGov', callback)
                },
                bcdevx_latest: function(callback) {
                    var options = {
                        url: "https://api.github.com/orgs/BCDevExchange/events?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
                        headers: {
                            'User-Agent': config.github.clientApplicationName
                        }
                    }
                    request(options, function(error, response, body) {
                        if(error) callback(error, null)

                        var githubEventsJSON = JSON.parse(body)
                        callback(null, handleEventData(githubEventsJSON))
                    })
                /*,
                 function(callback) {
                 db.countLinkedInAccounts(callback)
                 },
                 function(callback) {
                 db.countDualAccounts(callback)
                 }*/
                },
                bcgov_latest: function(callback) {
                    var options = {
                        url: "https://api.github.com/orgs/bcgov/events?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
                        headers: {
                            'User-Agent': config.github.clientApplicationName
                        }
                    }
                    request(options, function(error, response, body) {
                        if(error) callback(error, null)

                        var githubEventsJSON = JSON.parse(body)
                        callback(null, handleEventData(githubEventsJSON))
                    })
                },
                analytics: function(callback) {
                    var googleapis = require('googleapis'),
                        JWT = googleapis.auth.JWT,
                        analytics = googleapis.analytics('v3')

                    var SERVICE_ACCOUNT_EMAIL = config.google_analytics.api_email
                    var SERVICE_ACCOUNT_KEY_FILE = config.google_analytics.key_file

                    var authClient = new JWT(
                        SERVICE_ACCOUNT_EMAIL,
                        SERVICE_ACCOUNT_KEY_FILE,
                        null,
                        ['https://www.googleapis.com/auth/analytics.readonly']
                    )

                    authClient.authorize(function(err, tokens) {
                        if (err) {
                            if(err) callback(null, '')
                            return
                        }

                        analytics.data.ga.get({
                            auth: authClient,
                            'ids': 'ga:' + config.google_analytics.analytics_view_id,
                            'start-date': '7daysAgo',
                            'end-date': 'yesterday',
                            'metrics': 'ga:users'
                        }, function(err, result) {
                            if(err) callback(null, '')
                            callback(null, {'users': result.totalsForAllResults['ga:users']})
                        })
                    })
                },
                twitter_bcdev: function(callback) {
                    searchTwitter('#BCDev', callback)
                }
            }, function (err, results) {
                res.set('Cache-Control', 'max-age=' + config.github.cacheMaxAge)
                res.send(results)
            })
        }
    })
}

function getGithubOrgData(org, callback) {
    var options = {
        url: "https://api.github.com/orgs/" + org + "/repos?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
        headers: {
            'User-Agent': config.github.clientApplicationName
        }
    }
    request(options, function(error, response, body) {
        if(error) callback(error, null)

        var jsonGithub = JSON.parse(body)

        var total_stargazers = 0
        var total_watchers = 0
        var total_open_issues = 0

        var repoList = []

        for(var i in jsonGithub) {
            var repo = jsonGithub[i]
            total_stargazers += repo.stargazers_count
            total_open_issues += repo.open_issues_count

            repoList.push(repoHandler(repo.url))
        }

        function repoHandler(repoUrl) {
            return function(callback) {
                options = {
                    url: repoUrl + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
                    headers: {
                        'User-Agent': config.github.clientApplicationName
                    }
                }
                request(options, function(error, response, body) {
                    var jsonGithub = JSON.parse(body)
                    total_watchers += jsonGithub.subscribers_count
                    callback(null, total_watchers)
                })
            }
        }

        async.parallel(repoList, function() {
            var githubStats = {
                'stargazers': total_stargazers,
                'watchers': total_watchers,
                'open_issues': total_open_issues,
            }
            callback(null, githubStats)
        })
    })
}

function handleEventData(githubEventsJSON) {

    var Events = []

    for(var i in githubEventsJSON) {
        var Event = githubEventsJSON[i]

        var description = ''
        var icon = ''

        // A detailed list of each type of event from Github
        // is available at
        // https://developer.github.com/v3/activity/events/types/
        switch(Event.type) {

            case "IssueCommentEvent":
                var IssueCommentEvent = {
                    'actor': {
                        'username': Event.actor.login,
                        'url': 'https://github.com/' + Event.actor.login,
                        'avatar': Event.actor.avatar_url
                    },

                    'details': {
                        'description': 'commented on',
                        'name': Event.payload.issue.title,
                        'url': Event.payload.issue.html_url,
                        'when': Event.created_at,
                        'icon': 'comments'
                    }
                }
                Events.push(IssueCommentEvent)
            break

            case "IssuesEvent":
                description = ''
                icon = ''

                switch(Event.payload.action) {
                    case 'closed':
                        description = 'closed issue'
                        icon = 'times-circle'
                    break

                    case 'opened':
                        description = 'created issue'
                        icon = 'plus-circle'
                    break

                    case 'reopened':
                        description = 'reopened issue'
                        icon = 'chevron-circle-up'
                    break
                }
                if(description) {
                    var IssuesEvent = {
                        'actor': {
                            'username': Event.actor.login,
                            'url': 'https://github.com/' + Event.actor.login,
                            'avatar': Event.actor.avatar_url
                        },

                        'details': {
                            'description': description,
                            'name': Event.payload.issue.title,
                            'url': Event.payload.issue.html_url,
                            'when': Event.created_at,
                            'icon': icon
                        }
                    }
                    Events.push(IssuesEvent)
                }
            break

            case "PullRequestEvent":
                description = ''
                icon = ''

                switch(Event.payload.action) {
                    case 'closed':
                        if(Event.payload.pull_request.merged) {
                            description = 'merged pull request'
                            icon = 'code-fork'
                        }
                        else {
                            description = 'closed pull request'
                            icon = 'times-circle'
                        }
                    break

                    case 'opened':
                        description = 'created pull request'
                        icon = 'code-fork'
                    break

                    case 'reopened':
                        description = 'reopened pull request'
                        icon = 'chevron-circle-up'
                    break

                    case 'synchronize':
                        description = 'synchronized pull request'
                        icon = 'code-fork'
                    break

                }

                if(description) {
                    var PullRequestEvent = {
                        'actor': {
                            'username': Event.actor.login,
                            'url': 'https://github.com/' + Event.actor.login,
                            'avatar': Event.actor.avatar_url
                        },

                        'details': {
                            'description': description,
                            'name': Event.payload.pull_request.title,
                            'url': Event.payload.pull_request.html_url,
                            'when': Event.created_at,
                            'icon': icon
                        }
                    }
                    Events.push(PullRequestEvent)
                }
            break
        }
    }

    return Events
}

/*
    Uses the Twitter API to search for tweets containing searchText
    Returns an array of tweets:

    Example:
        tweets: [
            {
                'user': {
                    'name': 'BC Dev',
                    'screen_name': 'bcdevx',
                    'avatar': 'https://.../.png',
                    'url': 'https://twitter.com/bcdevx'
                },
                'text': 'An example tweet here'
                'url': 'https://twitter.com/...' (url to tweet on Twitter)
                'created_at': 'Mon May 11 17:02:39 +0000 2015'
            },
            ...
        ]
 */
function searchTwitter(searchText, callback) {
    var client = new Twitter({
        consumer_key: config.twitter.consumer_key,
        consumer_secret: config.twitter.consumer_secret,
        access_token_key: config.twitter.access_token_key,
        access_token_secret: config.twitter.access_token_secret
    })

    client.get('search/tweets', {q: searchText}, function(error, tweets, response) {
        if(error) {
            // We return no error so the async call will continue
            return callback(null, [])
        }

        var tweetList = []

        for(var i in tweets.statuses) {
            var tweet = tweets.statuses[i]

            tweetList.push(
                {
                    user: {
                        name: tweet.user.name,
                        screen_name: tweet.user.screen_name,
                        avatar: tweet.user.profile_image_url_https,
                        url: 'https://twitter.com/' + tweet.user.screen_name
                    },
                    text: twitter_text.autoLink(tweet.text),
                    url: 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
                    created_at: tweet.created_at
                }
            )
        }

        callback(null, tweetList)
    })
}
