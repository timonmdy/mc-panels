@if ($isLogExplorer)
  <div class="box box-primary">
    <div class="box-header with-border">
      <h3 class="box-title">Pterodactyl and Blueprint logs</h3>
      <a href="{{ $root }}" class="btn btn-default pull-right">Back to extension options</a>
    </div>
    <div class="box-body">
      <p class="text-muted">Root administrators only. Searches Pterodactyl/Laravel panel logs, including MC Panels entries, not Minecraft server console logs. Each search scans the newest 2 MiB (up to 20,000 lines) and is case-insensitive.</p>
      @if ($logError)
        <div class="alert alert-danger" role="alert">{{ $logError }}</div>
      @elseif (empty($logData['files']))
        <p>No readable <code>.log</code> files were found in the panel log directory.</p>
      @else
        <form action="{{ $root }}" method="GET" class="form-inline" style="margin-bottom: 15px">
          <input type="hidden" name="view" value="logs" />
          <div class="form-group" style="margin-right: 8px">
            <label for="mcp-log-file">Log file</label>
            <select id="mcp-log-file" name="file" class="form-control">
              @foreach ($logData['files'] as $file)
                <option value="{{ $file }}" @selected($logData['filename'] === $file)>{{ $file }}</option>
              @endforeach
            </select>
          </div>
          <div class="form-group" style="margin-right: 8px">
            <label for="mcp-log-query">Search</label>
            <input id="mcp-log-query" type="search" name="q" value="{{ $logData['query'] }}" maxlength="200" class="form-control" placeholder="Text in log lines" />
          </div>
          <button type="submit" class="btn btn-primary">Search</button>
        </form>
        @if ($logData['windowTruncated'] || $logData['lineLimitReached'])
          <div class="alert alert-info">
            @if ($logData['windowTruncated'])
              Only the newest 2 MiB were scanned because this log is larger.
            @endif
            @if ($logData['lineLimitReached'])
              The scan also reached its 20,000-line limit.
            @endif
            Increase the search specificity or inspect an older rotated log file.
          </div>
        @endif
        <p class="text-muted">Showing page {{ $logData['page'] }} of {{ $logData['pages'] }} · {{ $logData['matched'] }} matching lines from {{ $logData['scannedLines'] }} scanned lines.</p>
        <pre style="max-height: 65vh; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px">@forelse ($logData['lines'] as $line){{ $line }}
@empty
No matching log lines.
@endforelse</pre>
        @if ($logData['pages'] > 1)
          <nav aria-label="Log result pages">
            @if ($logData['page'] > 1)
              <a class="btn btn-default" href="{{ $root }}?view=logs&amp;file={{ rawurlencode($logData['filename']) }}&amp;q={{ rawurlencode($logData['query']) }}&amp;page={{ $logData['page'] - 1 }}">Newer</a>
            @endif
            @if ($logData['page'] < $logData['pages'])
              <a class="btn btn-default" href="{{ $root }}?view=logs&amp;file={{ rawurlencode($logData['filename']) }}&amp;q={{ rawurlencode($logData['query']) }}&amp;page={{ $logData['page'] + 1 }}">Older</a>
            @endif
          </nav>
        @endif
      @endif
    </div>
  </div>
@else
  <div class="box box-primary">
    <div class="box-body">
      <p>Need to troubleshoot MC Panels or the panel? <a href="{{ $root }}?view=logs">Open the log explorer</a> (root administrators only).</p>
    </div>
  </div>
  <form action="{{ $root }}" method="POST">
    @foreach ($sections as $title => $fields)
      <div class="box box-primary">
        <div class="box-header with-border">
          <h3 class="box-title">{{ $title }}</h3>
        </div>
        <div class="box-body">
          <div class="row">
            @foreach ($fields as $key => $field)
              <div class="form-group col-md-6">
                <label for="mcp-{{ $key }}" class="control-label">{{ $field['label'] }}</label>
                @if ($field['type'] === 'select')
                  <select id="mcp-{{ $key }}" name="{{ $key }}" class="form-control">
                    @foreach ($field['options'] as $value => $label)
                      <option value="{{ $value }}" @selected($values[$key] === $value)>{{ $label }}</option>
                    @endforeach
                  </select>
                @elseif ($field['type'] === 'bool')
                  <select id="mcp-{{ $key }}" name="{{ $key }}" class="form-control">
                    <option value="1" @selected($values[$key])>Enabled</option>
                    <option value="0" @selected(!$values[$key])>Disabled</option>
                  </select>
                @elseif ($field['type'] === 'int')
                  <input id="mcp-{{ $key }}" type="number" name="{{ $key }}" value="{{ $values[$key] }}" min="{{ $field['min'] }}" max="{{ $field['max'] }}" class="form-control" />
                @elseif ($field['type'] === 'textarea')
                  <textarea id="mcp-{{ $key }}" name="{{ $key }}" rows="5" class="form-control">{{ $values[$key] }}</textarea>
                @else
                  <input id="mcp-{{ $key }}" type="text" name="{{ $key }}" value="{{ $values[$key] }}" class="form-control" />
                @endif
                @isset($field['help'])
                  <p class="text-muted small">{{ $field['help'] }}</p>
                @endisset
              </div>
            @endforeach
          </div>
        </div>
      </div>
    @endforeach

    <div class="box box-primary">
      <div class="box-footer">
        {{ csrf_field() }}
        {{ method_field('PATCH') }}
        <button type="submit" class="btn btn-primary pull-right">Save settings</button>
      </div>
    </div>
  </form>
@endif
