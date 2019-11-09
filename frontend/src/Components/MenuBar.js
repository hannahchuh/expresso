import React from 'react';
import { Grid, Item, Header } from 'semantic-ui-react';

import * as cappuccino from '../Assets/cappuccino.jpeg';
import * as coffee from '../Assets/coffee.jpeg';
import * as latte from '../Assets/latte.jpeg';
import axios from 'axios';

class MenuBar extends React.Component {

  handleItemClick = (e) => {

    var itemId;

    axios.get('http://localhost:5000/customer/orderinfo').then(res => {
      console.log(res.data);
      itemId = res.data;
    });

    console.log('itemId :' + itemId);

   axios.post('http://localhost:5000/customer/makeorder',{
      items: ['Latte'],
      quantity: '1',
      orderid: '13'}).then(res => {
        console.log(res);
      });
  }
  render() {


    {/* Pull images from database */}
    return (
      <Grid>
        <Grid.Row>
          <Header style={{ 'font-size': '2em' }}>
            {this.props.title}
          </Header>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={1}>
          </Grid.Column>
          <Grid.Column width={15}>

            <Item.Group>

              <Item>
                <Item.Image src={coffee} />

                <Item.Content verticalAlign='middle'>
                  <Item.Header as='a'>Hot Coffee</Item.Header>
                  <Item.Meta>Not your everyday cup of Joe.</Item.Meta>
                </Item.Content>
              </Item>

              <Item>
                <Item.Image src={cappuccino} />

                <Item.Content verticalAlign='middle'>
                  <Item.Header as='a'>Cappuccino</Item.Header>
                  <Item.Meta>Imported from Italy.</Item.Meta>
                </Item.Content>
              </Item>

              <Item onClick={this.handleItemClick}>
                <Item.Image src={latte} />

                <Item.Content verticalAlign='middle'>
                  <Item.Header as='a'>Latte</Item.Header>
                  <Item.Meta>Extra milk. Extremely rich.</Item.Meta>
                </Item.Content>
              </Item>
            </Item.Group>

            <div style={{ height: '2em' }} />

          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default MenuBar;
