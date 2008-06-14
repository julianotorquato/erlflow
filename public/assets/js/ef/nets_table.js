(function(){
    var myDataTable;
    
    nets_table();
    
    function nets_table(){
        function onEventSelectRow(){
            process_info(this.getRecord(this.getSelectedRows()[0]));
        };
        
        var myColumnDefs = [{
            key: "id",
            label: "Id",
            sortable: true,
            label: "Id",
            sortable: true
        }, {
            key: "name"
        }];
        YAHOO.log('Setting datasource.', 'info', 'admin.js');
        this.myDataSource = new YAHOO.util.DataSource("/erlflow/");
        this.myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
        this.myDataSource.connXhrMode = "queueRequests";
        this.myDataSource.responseSchema = {
            resultsList: "networks",
            fields: ["id", "name"]
        };
        
        this.myDataTable = new YAHOO.widget.DataTable("processesDiv", myColumnDefs, this.myDataSource);
        
        var callback1 = {
            success: this.myDataTable.onDataReturnAppendRows,
            failure: this.myDataTable.onDataReturnAppendRows,
            scope: this.myDataTable
        };
        
        this.myDataTable.subscribe("rowClickEvent", this.myDataTable.onEventSelectRow);
        this.myDataTable.subscribe("rowClickEvent", onEventSelectRow);
        YAHOO.log('Sending request.', 'info', 'admin.js');
        this.myDataSource.sendRequest("nets", callback1);
    }
    
    function process_info(processName){
        var pId = processName.getData("id");
        var pName = processName.getData("name");
        var processURL = "/erlflow/net/" + pId;
        var oPanel = new YAHOO.widget.Panel("processinfo_" + pId, {
            constraintoviewport: true,
            fixedcenter: false,
            width: "400px",
            zIndex: 1,
            xy: [440, 40]
        });
        
        oPanel.setHeader(pName);
        oPanel.setBody("<div id='processesDiv_" + pId + "' align='left'><div id='infotable_" + pId + "'></div></div>");
        oPanel.render(document.body);
        var msg_section = YAHOO.util.Dom.get("infotable_" + pId);
        var callbacks = {
        
            success: function(o){
                YAHOO.log("RAW JSON DATA: " + o.responseText);
                
                // Process the JSON data returned from the server
                var response = [];
                try {
                    response = YAHOO.lang.JSON.parse(o.responseText);
                } 
                catch (x) {
                    alert("JSON Parse failed!");
                    return;
                }
                
                YAHOO.log("PARSED DATA: " + YAHOO.lang.dump(response));
				var br = document.createElement('br');
				
				msg = document.createTextNode("Modelo de Procesos: ");
				msg_section.appendChild(msg);
				var sUrl = "/pdefs/" + response.info.deffile;
				var link = document.createElement('a');
				link.setAttribute('href', sUrl);
				//link.setAttribute('target', '_blank');
				link.setAttribute('type', "application/x-xpdl");
				link.appendChild(document.createTextNode(response.info.deffile));
				msg_section.appendChild(link);
				
				msg_section.appendChild(document.createElement('br'));
				msg = document.createTextNode("Creation Date: " + response.info.created);
                msg_section.appendChild(msg);
				
				msg_section.appendChild(document.createElement('br'));
				msg = document.createTextNode("Descripci�n: " + response.info.description);
                msg_section.appendChild(msg);
				
				msg_section.appendChild(document.createElement('br'));
				msg = document.createTextNode("Transiciones: " + response.transitions.length);
                msg_section.appendChild(msg);
				msg_section.appendChild(document.createElement('br'));
				
				msg = document.createTextNode("Actividades: " + response.places.length);
                msg_section.appendChild(msg);
				msg_section.appendChild(document.createElement('br'));
				
            },
            
            failure: function(o){
                if (!YAHOO.util.Connect.isCallInProgress(o)) {
                    alert("Async call failed!");
                }
            },
            
            timeout: 3000
        }
        
        
        // Make the call to the server for JSON data
        YAHOO.util.Connect.asyncRequest('GET', processURL, callbacks);
        
    };
    
    })();
