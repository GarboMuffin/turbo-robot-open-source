const http = require('node:http');
const promClient = require('@prometheus-io/client');
const {
    Events
} = require('discord.js');

const client = require('./client');

const ready = new promClient.Gauge({
    name: 'turbo_robot_ready',
    help: 'Connected to Discord',
    collect() {
        this.set(client.isReady() ? 1 : 0);
    }
});

const ping = new promClient.Gauge({
    name: 'turbo_robot_ping_seconds',
    help: 'Discord ping',
    collect() {
        if (client.ws.ping >= 0) {
            this.set(client.ws.ping / 1000);
        }
    }
});

const events = new promClient.Counter({
    name: 'turbo_robot_events_total',
    help: 'Discord events',
    labelNames: ['event']
});

const EVENTS = [
    Events.MessageCreate,
    Events.MessageUpdate,
    Events.MessageDelete,
    Events.VoiceStateUpdate,
    Events.InteractionCreate,
    Events.MessageReactionAdd,
    Events.MessageReactionRemove,
    Events.MessageReactionRemoveEmoji,
    Events.MessageReactionRemoveAll,
    Events.GuildMemberAdd,
    Events.GuildMemberRemove,
    Events.GuildAuditLogEntryCreate
];

for (const event of EVENTS) {
    // Start at 0 instead of blank.
    events.inc({
        event
    }, 0);
    client.on(event, () => {
        events.inc({
            event
        });
    });
}

const listen = () => {
    if (!process.env.METRICS_PORT) {
        return;
    }

    const port = +process.env.METRICS_PORT;
    promClient.collectDefaultMetrics();

    const metricsServer = http.createServer((req, res) => {
        promClient.register.metrics()
            .then((body) => {
                res.setHeader('Content-Type', promClient.register.contentType);
                res.end(body);
            })
            .catch((error) => {
                console.error(error);
                res.statusCode = 500;
                res.end();
            });
    });

    metricsServer.listen(port, '127.0.0.1', () => {
        console.log(`Metrics on port ${port}`);
    });
};

module.exports = {
    listen
};
