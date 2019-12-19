import React from 'react';
import { Card, Container, Header, Grid, Button, Radio, Form, Divider, Dimmer, Loader } from 'semantic-ui-react';

class OrderPage extends React.Component {

  constructor(props) {
    super(props);

    let { shoppingCart } = this.props;
    let price = 0;
    for (let i = 0; i < shoppingCart.length; i++) {
      price += Number(shoppingCart[i].sp[1]);
      for (let j = 0; j < shoppingCart[i].addons.length; j++) {
        price += Number(shoppingCart[i].addons[j].price);
      }
    }

    this.state = {
      payment: true,
      totalPrice: price,
      toBeRemoved: null,
      emptyPopUp: false,
      confirm: false,
      remove: false,
      loading: false
    }
  }

  getPrice = () => {
    let { shoppingCart } = this.props;
    let price = 0;
    for (let i = 0; i < shoppingCart.length; i++) {
      price += Number(shoppingCart[i].sp[1]);
      for (let j = 0; j < shoppingCart[i].addons.length; j++) {
        price += Number(shoppingCart[i].addons[j].price);
      }
    }
    return price;
  }

  handleRemoveItem = (id) => {
    this.setState({ toBeRemoved: id });
    this.setState({ remove: true });
  }

  handleConfirmRemove = async () => {
    await this.props.handleRemoveItem(this.state.toBeRemoved);
    this.setState({ totalPrice: this.getPrice() });
    this.handleCloseConfirmRemove();
  }

  selectPayment = (payment) => {
    this.setState({ payment: payment });
  }

  handlePlaceOrder = () => {
    this.setState({ confirm: true });
  }

  handleConfirm = async () => {
    this.setState({ loading: true });
    if (this.props.shoppingCart.length === 0) {
      this.setState({ emptyPopUp: true });
      this.handleCloseConfirm();
      this.setState({ loading: false });
    }
    else {
      await this.props.postOrder(this.state.payment);
      await this.handleCloseConfirm();
      await this.props.emptyCart();
      await this.setState({ totalPrice: 0 });
      await this.setState({ loading: false });
      // this.props.history.push('/menu');
      this.props.redirect();
    }
  }

  handleCloseEmpty = () => {
    this.setState({ emptyPopUp: false });
  }

  handleCloseConfirm = () => {
    this.setState({ confirm: false });
  }

  handleCloseConfirmRemove = () => {
    this.setState({ toBeRemoved: null });
    this.setState({ remove: false });
  }

  render() {

    let currentOrder = (this.props.shoppingCart === 0) ?
    <Header as='h3'>
      Your order will show up here!
    </Header> :

    this.props.shoppingCart.map(item => {
      return (
        <React.Fragment>
          <Grid.Row>
            <Grid.Column width='6'>
              <Header as='h3' color='grey'>{item.item.name}</Header>
            </Grid.Column>
            <Grid.Column width='4'>
              <Header as='h3' color='grey'>{"$" + Number(item.sp[1]).toFixed(2)}</Header>
            </Grid.Column>
            <Grid.Column width='6'>
              <Button circular icon='close' size='mini' onClick={() => this.handleRemoveItem(item.id)}/>
            </Grid.Column>
          </Grid.Row>
          {item.addons.map(addon => {
            return (

              <Grid.Row>
                <Grid.Column width='1' />
                <Grid.Column width='5'>
                  <span>{"+ " + addon.name}</span>
                </Grid.Column>
                <Grid.Column width='4'>
                  <Header as='h3' color='grey'>{"$" + Number(addon.price).toFixed(2)}</Header>
                </Grid.Column>
                <Grid.Column width='6' />
              </Grid.Row>
            )
          })}
          <Divider />
        </React.Fragment>
      )
    });

    return (
      <React.Fragment>
        {/* Pop up to confirm empty cart */}
        <Dimmer active={this.state.emptyPopUp} onClickOutside={this.handleCloseEmpty} page>
          <Container style={{ width: '720px' }}>
            <Card fluid>
              <Card.Content>
                <Header as='h3' color='grey' style={{fontFamily:'Avenir'}}>
                  Add something to your cart to fuel your grind.
                </Header>
              </Card.Content>
              <Button style={{fontFamily:'Avenir'}} onClick={this.handleCloseEmpty}>
                Close Window
              </Button>
            </Card>
          </Container>
        </Dimmer>
        {/* Pop up to confirm order */}
        <Dimmer active={this.state.confirm} onClickOutside={this.handleCloseConfirm} page>
          <Container style={{ width: '720px' }}>
            <Card fluid>
              <Card.Content>
                <Header as='h3' color='grey' style={{fontFamily:'Avenir'}}>Are you sure you're all finished?</Header>
                <Header as='h4' color='black' style={{fontFamily:'Avenir'}}>
                  Clicking “All Set” WILL charge your student account if you selected student charge.
                  If you selected to “pay in store” and do not pay before the end of the day,
                  your student account will be charged, whether you picked up your food/beverage or not.
                </Header>
              </Card.Content>
              <Button.Group>
                <Button onClick={this.handleCloseConfirm}>Cancel</Button>
                <Button positive style={{backgroundColor:'#85A290'}}onClick={this.handleConfirm}>All Set!</Button>
              </Button.Group>
            </Card>
          </Container>
        </Dimmer>
        {/* Pop up to confirm removal */}
        <Dimmer active={this.state.remove} onClickOutside={this.handleCloseConfirmRemove} page>
          <Container style={{ width: '720px' }}>
            <Card fluid>
              <Card.Content>
                <Header as='h3' color='grey'>Are you sure want to remove this from your cart?</Header>
              </Card.Content>
              <Button.Group>
                <Button onClick={this.handleCloseConfirmRemove}>Cancel</Button>
                <Button negative onClick={() => this.handleConfirmRemove()}>Remove</Button>
              </Button.Group>
            </Card>
          </Container>
        </Dimmer>
        {/* Dimmer for loading */}
        <Dimmer active={this.state.loading} page inverted>
          <Loader inverted>Loading</Loader>
        </Dimmer>

        {/* Main component */}
        <Container style={{ width: '720px' }}>
          <Card fluid style={{padding:'5%'}}>
            <Card.Content>
              <Grid stackable>
                <Grid.Row>
                  <Grid.Column>
                    <Header as='h2' style={{fontFamily:'Didot', fontStyle:'italic', color:'black'}}>01. Order</Header>
                  </Grid.Column>
                </Grid.Row>
                {currentOrder}
              </Grid>
              <Grid>
                <Grid.Row>
                  <Grid.Column width='3'>
                    <Header as='h3' style={{fontFamily:'Avenir', color:'black'}}>Total</Header>
                  </Grid.Column>
                  <Grid.Column width='3' />
                  <Grid.Column>
                    <Header as='h3' color='black'>{"$" + this.state.totalPrice.toFixed(2)}</Header>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Card.Content>
            <Card.Content>
              <Grid>
                <Grid.Row>
                  <Grid.Column>
                    <Header as='h2'
                      style={{fontFamily:'Didot',
                        fontStyle:'italic',
                        color:'black',
                        paddingTop:'1em'}}>
                      02. Payment
                    </Header>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <Form>
                      <Form.Field>
                        <Radio
                          label='Student Charge'
                          name='payment'
                          checked={this.state.payment}
                          onChange={() => this.selectPayment(true)}
                        />
                      </Form.Field>
                      <Form.Field>
                        <Radio
                          label='Pay at Store'
                          name='payment'
                          checked={!this.state.payment}
                          onChange={() => this.selectPayment(false)}
                        />
                      </Form.Field>
                    </Form>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Card.Content>
            <div>
              <Button circular floated='right' style={{backgroundColor:'#EDAC86'}} onClick={this.handlePlaceOrder}>
                PLACE ORDER
              </Button>
            </div>
          </Card>
        </Container>
      </React.Fragment>

    );
  }
}

export default OrderPage;
