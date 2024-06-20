// Copyright (c) 2022 Siemens

/**
 * @module js/Mtw0ShowAddObjectService
 */
import _ from 'lodash';
import commandPanelService from 'js/commandPanel.service';
import addObjectUtils from 'js/addObjectUtils';
import _appCtxSvc from 'js/appCtxService';
import _cdmSvc from 'soa/kernel/clientDataModel';
import dmSvc from 'soa/dataManagementService';

var exports = {};

/**
* This function create a input object for soa call
*
* @returns {Object} - Returns selected objects
*/
export let getSelectedLines = function() {
    var varunderlyingObj = null;
    if ( _appCtxSvc.ctx.selected.modelType.typeHierarchyArray.indexOf( 'Awb0ConditionalElement' ) > -1  ) {
        let tmpSelected = _cdmSvc.getObject( _appCtxSvc.ctx.selected.uid );
        varunderlyingObj = _cdmSvc.getObject( tmpSelected.props.awb0UnderlyingObject.dbValues[0] );
    } else {
        varunderlyingObj = _cdmSvc.getObject( _appCtxSvc.ctx.selected.uid );
    }
    return varunderlyingObj;
};

/**
 * Update search state with custom data provider and search details
 * @returns {searchState}
 */
export const initializeSearchState = ( parentUid, searchString, isSearchPanel, objectSet, dataProviderName ) => {
    const newSearchState = {};

    newSearchState.criteria = {
        parentUid: parentUid,
        limitedFilterCategoriesEnabled: 'true',
        isSearchPanel: isSearchPanel,
        objectSet: objectSet
    };
    newSearchState.provider = dataProviderName;
    return { value: newSearchState, hideFilters: true };
};

/**
 * This method sets the Relation and the Secondary object in context when xrt object-set 'Add to' command is
 * clicked.
 *
 * @param {data}{ctx} data , ctx
 * @return {ObjectArray} input data
 */
export let activateShowAddObjectPanel = function( commandId, location, data, ctx, objectSetSource ) {
    var secondaryObjFromObjectSource = null;
    var secondaryObjForXrtCreate = null;
    var relationSecondaryObjArr = objectSetSource.split( '.' );
    secondaryObjFromObjectSource = relationSecondaryObjArr[ 1 ];
    if( _.endsWith( secondaryObjFromObjectSource, 'Revision' ) ) {
        var a = secondaryObjFromObjectSource.indexOf( 'Revision' );
        secondaryObjForXrtCreate = secondaryObjFromObjectSource.substring( 0, a ).trim();
    } else {
        secondaryObjForXrtCreate = secondaryObjFromObjectSource;
    }

    _appCtxSvc.updateCtx( 'secondaryObjFromObjectSource', secondaryObjFromObjectSource );
    _appCtxSvc.updateCtx( 'secondaryObjForXrtCreate', secondaryObjForXrtCreate );
    var searchFilter = 'WorkspaceObject.object_type=' + secondaryObjFromObjectSource;
    _appCtxSvc.updateCtx( 'searchFilter', searchFilter );

    let selected = getSelectedLines( );
    if ( selected.props && selected.props.sci0IsSemicomponent && selected.props.sci0IsSemicomponent.dbValues[0] === '1' ) {
        relationSecondaryObjArr[ 0 ] = 'Sci0UsesMaterials';
    }

    _appCtxSvc.updateCtx( 'relation', relationSecondaryObjArr[0] );
    commandPanelService.activateCommandPanel( commandId, location );
};

/**
 * Private method to create input data required for "createObjects" SOA.
 *
 * @param {data}{ctx} data , ctx
 * @return {ObjectArray} input data
 */
var prepareDataForCreateObjectSOA = function( data, ctx, operationType, editHandler ) {
    var doubleObj = {};
    var boolObj = {};
    var strObj = {};
    var tagObj = {};
    var tempData = _.clone( data );
    var boName = _appCtxSvc.ctx.relation;
    var relationPrimaryObj = _appCtxSvc.ctx.selected;
    // if its Ace View take xrtSummaryContextObject
    if( relationPrimaryObj && !relationPrimaryObj.modelType.typeHierarchyArray.includes( 'ItemRevision' ) ) {
        relationPrimaryObj = _appCtxSvc.ctx.xrtSummaryContextObject;
    }
    var inputData = [];

    for( var i = 0; i < data.addPanelState.sourceObjects.length; i++ ) {
        var relationSecondaryObj = data.addPanelState.sourceObjects[i];

        tagObj = {
            primary_object: relationPrimaryObj,
            secondary_object: relationSecondaryObj
        };


        var selectedType = {
            dbValue: boName
        };

        var relationProps = data.xrtStateRelation.xrtVMO.props;
        _.forEach( relationProps, function( vmProp, name ) {
            if( vmProp.type === 'DOUBLE' && vmProp.dbValue ) {
                doubleObj[ name ] = vmProp.dbValue;
            }
            if( vmProp.type === 'BOOLEAN' ) {
                boolObj[ name ] = vmProp.dbValue;
            }
            if( vmProp.type === 'STRING' ) {
                strObj[ name ] = vmProp.dbValue;
            }
            if( vmProp.type === 'OBJECT' && operationType !== 'RELATION' ) {
                tagObj[ name ] = vmProp.dbValue;
            }
        } );

        var input = {
            clientId: '',
            data: {
                boName: boName,
                doubleProps: doubleObj,
                boolProps: boolObj,
                stringProps: strObj,
                tagProps: tagObj
            }
        };
        inputData.push( input );
    }

    return inputData;
};

export let getInputForCreateSOA = function( data, ctx, editHandler ) {
    var boName = ctx.secondaryObjForXrtCreate;
    return addObjectUtils.getCreateInput( data, null, boName );
};

/**
 * This method creates input data required for "createObjects" SOA for relating secondary object with primary
 * object.
 *
 * @param {data}{ctx} data , ctx
 * @return {ObjectArray} input data
 */
export let getInputForRelationSOA = function( data, ctx, editHandler ) {
    return prepareDataForCreateObjectSOA( data, ctx, 'RELATION', editHandler );
};

export let callInitiateRelationPanel = function( data ) {
    var relationPrimaryObj = _appCtxSvc.ctx.selected;

    var relationSecondaryObj = data.addPanelState.selectedTab.pageId === 'new' ? data.createdObject : data.addPanelState.sourceObjects[0];
    if( relationSecondaryObj && relationSecondaryObj.modelType.typeHierarchyArray.includes( 'Item' ) ) {
        return dmSvc.getProperties( [ relationSecondaryObj.uid ], [ 'revision_list' ] ).then( function( response ) {
            if( response ) {
                if( relationSecondaryObj !== null ) {
                    _appCtxSvc.updateCtx( 'relationPrimaryObj', relationPrimaryObj );
                    _appCtxSvc.updateCtx( 'relationSecondaryObj', _cdmSvc.getObject( relationSecondaryObj.props.revision_list.dbValues[0] ) );
                    commandPanelService.activateCommandPanel( 'Mtw0ShowAddObjectRelation', 'aw_toolsAndInfo', _appCtxSvc.ctx );
                }
            }
        } );
    }
    if( relationSecondaryObj !== null ) {
        _appCtxSvc.updateCtx( 'relationPrimaryObj', relationPrimaryObj );
        _appCtxSvc.updateCtx( 'relationSecondaryObj', relationSecondaryObj );
        commandPanelService.activateCommandPanel( 'Mtw0ShowAddObjectRelation', 'aw_toolsAndInfo', _appCtxSvc.ctx );
    }


    return;
};

export default exports = {
    activateShowAddObjectPanel,
    getInputForCreateSOA,
    getInputForRelationSOA,
    getSelectedLines,
    callInitiateRelationPanel,
    initializeSearchState
};
