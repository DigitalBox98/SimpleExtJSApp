INSERT INTO task VALUES('RunRrUpdate', '', 'bootup', '', 0, 0, 0, 0, '', 0, '/usr/bin/rr-update.sh updateRR /volume1/downloads/tmp_rr_update/update.zip /tmp/rr_update_progress', 'script', '{}', '', '', '{}', '{}');
INSERT INTO task VALUES('SetRootPrivsToRrManager', '', 'bootup', '', 0, 0, 0, 0, '', 0, 'sed -i 's/package/root/g' /var/packages/rr-manager/conf/privilege && synopkg restart rr-manager', 'script', '{}', '', '', '{}', '{}');

