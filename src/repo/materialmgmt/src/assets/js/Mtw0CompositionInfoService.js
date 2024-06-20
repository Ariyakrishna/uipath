// Copyright (c) 2022 Siemens

/**
 * @module js/Mtw0CompositionInfoService
 */
import appCtxSvc from 'js/appCtxService';
import selectionService from 'js/selection.service';
import commandsMapService from 'js/commandsMapService';
import tcSesnD from 'js/TcSessionData';
import cdm from 'soa/kernel/clientDataModel';
import viewModelObjectService from 'js/viewModelObjectService';
import _ from 'lodash';
import parsingUtils from 'js/parsingUtils';

var exports = {};

/**
 * return clientScopeURI on the basis of TC version and object type.
 */
export let getClientScopeURI = function( data ) {
    var selection = selectionService.getSelection().selected;
    var clientScopeURI = 'CompostionTabColConfig113B';
    var displayLegacyCompositionTab = false;

    var selected = null;
    if( !commandsMapService.isInstanceOf( 'Awb0DesignElement', selection[ 0 ].modelType ) ) {
        selected = selection[ 0 ];
    } else {
        selected = cdm.getObject( selection[ 0 ].props.awb0UnderlyingObject.dbValues[ 0 ] );
    }

    /**
     * If MATERIALMGMTAW_Display_Legacy_Composition_Tab preference is defined and has 'true' value
     * then show the legacy composition tab.
     */
    if( 'preferences' in appCtxSvc.ctx &&
        'MATERIALMGMTAW_Display_Legacy_Composition_Tab' in appCtxSvc.ctx.preferences &&
        appCtxSvc.ctx.preferences.MATERIALMGMTAW_Display_Legacy_Composition_Tab !== undefined &&
        appCtxSvc.ctx.preferences.MATERIALMGMTAW_Display_Legacy_Composition_Tab[ 0 ] === 'true' ) {
        displayLegacyCompositionTab = true;
    }

    /**
     * If ItemRev does not have related VendorPart then show the legacy composition tab.
     */
    if( commandsMapService.isInstanceOf( 'ItemRevision', selected.modelType ) === true &&
        ( selected.props.VMRepresents === undefined ||
            selected.props.VMRepresents !== undefined &&
            selected.props.VMRepresents.dbValues.length === 0 ) ) {
        displayLegacyCompositionTab = true;
    }

    if( !commandsMapService.isInstanceOf( 'ManufacturerPart', selected.modelType ) &&
        !commandsMapService.isInstanceOf( 'Scp0PartMSDDeclRevision', selected.modelType ) &&
        !commandsMapService.isInstanceOf( 'Scp0PartCMDDeclRevision', selected.modelType ) &&
        ( tcSesnD.getTCMajorVersion() >= 11 && tcSesnD.getTCMinorVersion() >= 2 &&
            tcSesnD.getTCQRMNumber() >= 5 || tcSesnD.getTCMajorVersion() >= 12 ) &&
        displayLegacyCompositionTab === false ) {
        clientScopeURI = 'CompostionTabColConfig';
    } else {
        clientScopeURI = 'CompostionTabColConfig113B';
    }

    return clientScopeURI;
};

/**
 * This method prepares the material and substance list corresponding
 * to the search results. For substance entry, material context information
 * is also populated by the "Mtw0MaterialSubstanceProvider" provider to make
 * the entry unique so that AWC framework will be able to identify it as unique.
 *
 * This method removes the material context information from the substance
 * entry to avoid display of repeated material information.
 *
 * @param { Object } response - response
 * @return{ ObjectArray } - List of modified material/substance row object
 *
 */
export let prepareMaterialSubstanceList = function( response ) {
    var materialSubsObjects = [];
    if( response.searchResultsJSON ) {
        var searchResults = parsingUtils.parseJsonString( response.searchResultsJSON );
        if( searchResults && searchResults.objects.length > 0 ) {
            // View model Objects returned in "searchResults" contain only DCP property values.
            // Those must be populated with model object properties as well.
            // "createViewModelObject" populates model object properties on VMO object.
            searchResults.objects = searchResults.objects.map( function( vmo ) {
                return viewModelObjectService.createViewModelObject( vmo.uid, 'EDIT', null, vmo );
            } );

            _.forEach( searchResults.objects, function( currentEntry ) {
                if( currentEntry ) {
                    //var currentVmoUid = currentEntry.uid;
                    //var currentModelObj = response.ServiceData.modelObjects[ currentVmoUid ];

                    if( currentEntry.props.mtw0Substance.dbValues !== undefined &&
                        currentEntry.props.mtw0Substance.dbValues[ 0 ] !== null ) {
                        // Current entry is pertaining to substance, set the material uiValue as empty string
                        if( currentEntry.props.mtw0Material.uiValues[ 0 ] ) {
                            currentEntry.props.mtw0Material.uiValues[ 0 ] = '';
                            currentEntry.props.mtw0Material.uiValue = '';
                        }
                    } // else current entry is not for substance, no modification required in the entry.

                    // Add modified substance or un-modified composition table entry to "materialSubsObjects" array
                    if( currentEntry ) {
                        // Add modified substance or un-modified composition table entry to "materialSubsObjects" array
                        materialSubsObjects.push( currentEntry );
                    }
                }
            } );
        }
    }
    return materialSubsObjects;
};

/**
 * Composition Dashboard panel service utility
 *
 * @member Services
 * @member Mtw0CompositionInfoService
 */

export default exports = {
    getClientScopeURI,
    prepareMaterialSubstanceList
};
