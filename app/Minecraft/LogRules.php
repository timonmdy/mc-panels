<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft;

final class LogRules
{
    public const LINE = '/^\[(?:\d{2}[A-Za-z]{3}\d{4} )?(\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:\] \[[^\]]*?\/| )(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)\](?: \[[^\]]*\])?:? ?(.*)$/';

    public const EVENTS = [
        'login' => '/^(?<name>\w{1,16})\[\/?(?<ip>.+):\d+\] logged in with entity id/',
        'join' => '/^(?<name>\w{1,16}) joined the game$/',
        'leave' => '/^(?<name>\w{1,16}) left the game$/',
        'uuid' => '/^UUID of player (?<name>\w{1,16}) is (?<uuid>[0-9a-fA-F-]{32,36})$/',
        'stopping' => '/^Stopping (?:the )?server/',
        'tps' => '/^(?:TPS from last [^:]+|(?:Current )?TPS(?:\s*\([^)]*\))?)\s*:\s*(?<value>.+)$/i',
        'mspt' => '/(?:Average time per tick|Average tick time):\s*(?<value>[\d.]+)\s*ms/i',
    ];

    public const FAILURE_LINES = [
        '/^Disconnecting (?<who>.+?) \(\/(?<ip>.+?):\d+\): (?<text>.*)$/',
        '/^(?<who>.+?) \(\/(?<ip>.+?):\d+\) lost connection: (?<text>.*)$/',
        '/^Disconnecting \/(?<ip>.+?):\d+: (?<text>.*)$/',
    ];

    public const FAILURE_REASONS = [
        'not_whitelisted' => '/not whitelisted/i',
        'banned' => '/banned/i',
        'version_mismatch' => '/outdated (?:server|client)|incompatible|unsupported/i',
        'server_full' => '/server is full/i',
        'auth_failed' => '/failed to verify|authentication|session|invalid session/i',
        'duplicate_login' => '/logged in from another location|already (?:online|logged)|duplicate/i',
        'timeout' => '/timed? ?out|timeout/i',
        'protocol_error' => '/internal exception|decoderexception|badly compressed|bad packet|bad packet id/i',
        'aborted' => '/^disconnected$|end of stream|connection (?:reset|closed)|quitting/i',
    ];

    public const META = [
        ['software' => 'paper', 'mc' => 'mc', 'rule' => '/This server is running (?<software>[A-Za-z]+) version .*?\(MC: (?<mc>[\d.]+)\)/'],
        ['software' => 'fabric', 'mc' => 'mc', 'rule' => '/Loading Minecraft (?<mc>[\d.]+) with Fabric Loader/'],
        ['software' => 'quilt', 'mc' => 'mc', 'rule' => '/Loading Minecraft (?<mc>[\d.]+) with Quilt Loader/'],
        ['software' => 'neoforge', 'rule' => '/NeoForge mod loading/'],
        ['software' => 'forge', 'rule' => '/Forge mod loading, version/'],
        ['mc' => 'mc', 'rule' => '/Starting minecraft server version (?<mc>[\w.\-]+)/'],
    ];

    public const SYSTEM = '/Running Java (?<java>\d+)[^\n]*? on (?<os>[A-Za-z]+) [^\s]+ \((?<arch>[\w\-]+)\)/';
}
