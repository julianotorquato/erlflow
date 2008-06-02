(function() {
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        layout2 = null,
        dataTable = null;

        YAHOO.log('Using loader to fetch datatable and editor (for the toolbar)', 'info', 'inbox.js');
        var loader = new YAHOO.util.YUILoader({
            base: '/build/',
            require: ['datatable', 'editor'],
            ignore: ['containercore'],
            onSuccess: function() {
                YAHOO.log('Inject some HTML for the content of this layout.', 'info', 'inbox.js');
                var d = document.createElement('div');
                d.innerHTML = '<div id="top2"><div id="inboxToolbar"></div><div id="standard"></div></div><div id="center2"><div class="yui-layout-bd"><div id="preview"><p><strong>Got your eye on one of those messages up there?</strong></p><p>To view your message down here in this handy Reading pane, just click on it.</p></div></div></div>';
                document.body.appendChild(d);
                YAHOO.log('Creating a second Layout for the inbox and preview pane', 'info', 'inbox.js');
                layout2 = new YAHOO.widget.Layout('inboxHolder', {
                    parent: YAHOO.example.app.layout,
                    units: [
                        { position: 'top', height: '300px', maxHeight: 700, resize: true, id: 'top2', gutter: '0 0 15 0' },
                        { position: 'center', id: 'center2', gutter: '0 0 1 0', scroll: true }
                    ]
                });
                //before the resize, update the parent with the proper height
                layout2.on('beforeResize', function() {
                    Dom.setStyle('inboxHolder', 'height', Dom.getStyle(YAHOO.example.app.tabView._contentParent, 'height'));
                });
                //On resize, resize the table and set the custom width on the Subject Column
                layout2.on('resize', function() {
                    if (dataTable) {
                        this.getUnitByPosition('top')._setWidth(Dom.get('standard'), this.getSizes().top.w);
                        this.getUnitByPosition('top')._setWidth(Dom.get('yui-dt0-table'), this.getSizes().top.w);
                        dataTable.set('height', (this.getSizes().top.h - 27 - YAHOO.example.app.inboxToolbarHeight) + 'px');
                        dataTable.set('width', (this.getSizes().top.w) + 'px');
                        dataTable.setColumnWidth(dataTable.getColumn('Subject'), (this.getSizes().top.w - magicNum));
                        dataTable._syncColWidths();
                        dataTable._syncScrollPadding();
                    }
                }, layout2, true);
                layout2.on('render', function() {
                    YAHOO.log('On render create the inbox Toolbar', 'info', 'inbox.js');
                    YAHOO.example.app.inboxToolbar = new YAHOO.widget.Toolbar('inboxToolbar', {
                        buttons: [
                            { id: 'tb_delete', type: 'push', label: 'Rechazar', value: 'delete'},
                            { type: 'separator' },
                            { id: 'tb_forward', type: 'push', label: 'Reasignar', value: 'forward' },
                            { type: 'separator' },
                            { id: 'tb_spam', type: 'push', label: 'Observaci&oacute;', value: 'spam' },
                            { type: 'separator' },
                            { id: 'tb_move', type: 'push', label: 'Procesar', value: 'move' },
                            { id: 'tb_print', type: 'push', label: 'Imprimir', value: 'print' }
                        ]
                    });
                    //Show an alert message with the button they clicked
                    YAHOO.example.app.inboxToolbar.on('buttonClick', function(ev) {
                        var data = dataTable.getRecordSet().getRecord(dataTable.getSelectedRows()[0])._oData;
                        YAHOO.example.app.alert(ev.button.label + ': ' + data.Subject);
                    });
                    //Grab it's height for later use
                    YAHOO.example.app.inboxToolbarHeight = Dom.get('inboxToolbar').clientHeight + 3;
                    
                    window.setTimeout(function() {
                        YAHOO.log('Using get to call the Yahoo! Pipe for the inbox feed', 'info', 'inbox.js');
                        YAHOO.util.Get.script('/erlflow');
                    }, 0);
                }, layout2, true);
                layout2.render();
                YAHOO.example.app.layout2 = layout2;
            }
        });
        //Have loader insert only the JS files.
        loader.insert({}, 'js');
})();
