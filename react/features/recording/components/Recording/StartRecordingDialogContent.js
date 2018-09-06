// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    createRecordingDialogEvent,
    sendAnalytics
} from '../../../analytics';
import { translate } from '../../../base/i18n';
import {
    Container,
    LoadingIndicator,
    Switch,
    Text
} from '../../../base/react';
import { authorizeDropbox, updateDropboxToken } from '../../../dropbox';

import styles from './styles';

type Props = {

    /**
     * The redux dispatch function.
     */
    dispatch: Function,

    /**
     * <tt>true</tt> if we have valid oauth token.
     */
    isTokenValid: boolean,

    /**
     * <tt>true</tt> if we are in process of validating the oauth token.
     */
    isValidating: boolean,

    /**
     * Number of MiB of available space in user's Dropbox account.
     */
    spaceLeft: ?number,

    /**
     * The translate function.
     */
    t: Function,

    /**
     * The display name of the user's Dropbox account.
     */
    userName: ?string,
};

/**
 * React Component for getting confirmation to start a file recording session.
 *
 * @extends Component
 */
class StartRecordingDialogContent extends Component<Props> {
    /**
     * Initializes a new {@code StartRecordingDialogContent} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        // Bind event handler so it is only bound once for every instance.
        this._signIn = this._signIn.bind(this);
        this._signOut = this._signOut.bind(this);
        this._onSwitchChange = this._onSwitchChange.bind(this);
    }

    /**
     * Renders the component.
     *
     * @protected
     * @returns {React$Component}
     */
    render() {
        const { isTokenValid, isValidating, t } = this.props;

        let content = null;

        if (isValidating) {
            content = this._renderSpinner();
        } else if (isTokenValid) {
            content = this._renderSignOut();
        }

        // else { // Sign in screen:
        // We don't need to render any additional information.
        // }

        return (
            <Container
                className = 'recording-dialog'
                style = { styles.container }>
                <Container
                    className = 'recording-header'
                    style = { styles.header }>
                    <Text
                        className = 'recording-title'
                        style = { styles.title }>
                        { t('recording.authDropboxText') }
                    </Text>
                    <Switch
                        disabled = { isValidating }
                        onValueChange = { this._onSwitchChange }
                        style = { styles.switch }
                        value = { isTokenValid } />
                </Container>
                <Container
                    className = 'authorization-panel'>
                    { content }
                </Container>
            </Container>
        );
    }

    _onSwitchChange: boolean => void;

    /**
     * Handler for onValueChange events from the Switch component.
     *
     * @returns {void}
     */
    _onSwitchChange() {
        if (this.props.isTokenValid) {
            this._signOut();
        } else {
            this._signIn();
        }
    }

    /**
     * Renders a spinner component.
     *
     * @returns {React$Component}
     */
    _renderSpinner() {
        return (
            <LoadingIndicator
                isCompleting = { false }
                size = 'medium' />
        );
    }

    /**
     * Renders the screen with the account information of a logged in user.
     *
     * @returns {React$Component}
     */
    _renderSignOut() {
        const { spaceLeft, t, userName } = this.props;

        return (
            <Container>
                <Container
                    className = 'logged-in-panel'
                    style = { styles.loggedIn }>
                    <Container>
                        <Text>
                            { t('recording.loggedIn', { userName }) }
                        </Text>
                    </Container>
                    <Container>
                        <Text>
                            {
                                t('recording.availableSpace', {
                                    spaceLeft,

                                    // assuming 1min -> 10MB recording:
                                    duration: Math.floor((spaceLeft || 0) / 10)
                                })
                            }
                        </Text>
                    </Container>
                </Container>
                <Container style = { styles.startRecordingText }>
                    <Text>{ t('recording.startRecordingBody') }</Text>
                </Container>
            </Container>
        );
    }

    _signIn: () => {};

    /**
     * Sings in a user.
     *
     * @returns {void}
     */
    _signIn() {
        sendAnalytics(
            createRecordingDialogEvent('start', 'signIn.button')
        );
        this.props.dispatch(authorizeDropbox());
    }

    _signOut: () => {};

    /**
     * Sings out an user from dropbox.
     *
     * @returns {void}
     */
    _signOut() {
        sendAnalytics(
            createRecordingDialogEvent('start', 'signOut.button')
        );
        this.props.dispatch(updateDropboxToken());
    }
}

export default translate(connect()(StartRecordingDialogContent));
