import React from 'react';

export const ConsoleIssuesInfo = () => (
    <>
        <p>Console errors and warnings are read from the server's current logs/latest.log file; they are not stored in the MC Panels database.</p>
        <p>Only issues from the current day's log are shown. The selected dashboard time span does not affect this panel.</p>
    </>
);
