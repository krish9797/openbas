import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Map, fromJS} from 'immutable'
import createImmutableSelector from '../../../../utils/ImmutableSelect'
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {updateAudience} from '../../../../actions/Audience'
import {fetchUsers, searchUsers} from '../../../../actions/User'
import {Dialog} from '../../../../components/Dialog';
import {Chip} from '../../../../components/Chip';
import {Avatar} from '../../../../components/Avatar';
import {List} from '../../../../components/List'
import {AvatarListItemLink} from '../../../../components/list/ListItem';
import {FlatButton, FloatingActionsButtonCreate} from '../../../../components/Button';
import {SimpleTextField} from '../../../../components/SimpleTextField'

const styles = {
  dialog: {
    width: '780px',
    minHeight: '500px',
    maxWidth: 'none'
  },
  list: {
    float: 'right',
    width: '200px',
    height: '100%',
    padding: '0 0 0 10px',
    borderLeft: '1px solid #f0f0f0'
  },
  search: {
    float: 'left',
    width: '460px',
    padding: '0 10px 0 0',
  }
}

class AddUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAddUsers: false,
      openCreateUser: false,
      users: Map(),
    }
  }

  componentDidMount() {
    this.props.fetchUsers();
  }

  handleOpenAddUsers() {
    this.setState({openAddUsers: true})
  }

  handleCloseAddUsers() {
    this.setState({openAddUsers: false})
  }

  handleOpenCreateUser() {
    this.setState({openCreateUser: true})
  }

  handleCloseCreateUser() {
    this.setState({openCreateUser: false})
  }

  handleSearchUsers(event, value) {
    this.props.searchUsers(value)
  }

  addUser(user) {
    this.setState({users: this.state.users.set(user.get('user_id'), user)})
  }

  removeUser(user) {
    this.setState({users: this.state.users.delete(user.get('user_id'))})
  }

  createUser() {
  }

  submitAddUsers() {
    let data = Map({
      audience_users: this.state.users
    })
    this.props.updateAudience(this.props.exerciseId, this.props.audienceId, data)
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseAddUsers.bind(this)}
      />,
      <FlatButton
        label="Add users"
        primary={true}
        onTouchTap={this.submitAddUsers.bind(this)}
      />,
    ];

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING_PADDING}
                                     onClick={this.handleOpenAddUsers.bind(this)}/>
        <Dialog
          modal={false}
          open={this.state.openAddUsers}
          onRequestClose={this.handleCloseAddUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={actions}
          contentStyle={styles.dialog}
        >
          <SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for a user"
                           onChange={this.handleSearchUsers.bind(this)}/>

          <div style={styles.list}>
            {this.state.users.toList().map(user => {
              return (
                <Chip
                  key={user.get('user_id')}
                  onRequestDelete={this.removeUser.bind(this, user)}
                  type={Constants.CHIP_TYPE_LIST}
                >
                  <Avatar src={user.get('user_gravatar')}/>
                  {user.get('user_firstname')} {user.get('user_lastname')}
                </Chip>
              )
            })}
          </div>
          <div style={styles.search}>
            <List>
              {this.props.users.toList().map(user => {
                let disabled = false
                return (
                  <AvatarListItemLink
                    key={user.get('user_id')}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user)}
                    label={user.get('user_firstname') + " " + user.get('user_lastname')}
                    leftAvatar={<Avatar type={Constants.AVATAR_TYPE_LIST} src={user.get('user_gravatar')}/>}
                  />
                )
              })}
              <AvatarListItemLink
                key="create"
                onClick={this.createUser.bind(this)}
                label={<i>Create a new user</i>}
                leftAvatar={<Avatar type={Constants.AVATAR_TYPE_LIST}
                                    src="https://www.gravatar.com/avatar/00000000?d=mm&f=y"/>}
              />
            </List>
          </div>
        </Dialog>
      </div>
    );
  }
}

const usersSelector = (state, props) => {
  const users = state.application.getIn(['entities', 'users']).toJS()
  let keyword = state.application.getIn(['ui', 'states', 'current_search_keyword'])
  var filterByKeyword = n => keyword === '' || n.user_email.toLowerCase().indexOf(keyword) !== -1 || n.user_firstname.toLowerCase().indexOf(keyword) !== -1 || n.user_lastname.toLowerCase().indexOf(keyword) !== -1
  var filteredUsers = R.filter(filterByKeyword, users)
  return fromJS(filteredUsers)
}

const filteredUsers = createImmutableSelector(usersSelector, users => users)

AddUsers.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  fetchUsers: PropTypes.func,
  searchUsers: PropTypes.func,
  updateAudience: PropTypes.func,
  users: PropTypes.object
}

const select = (state, props) => {
  return {
    users: filteredUsers(state, props),
  }
}

export default connect(select, {fetchUsers, searchUsers, updateAudience})(AddUsers);