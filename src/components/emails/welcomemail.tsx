import {
    Body,
    Column,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
  } from '@react-email/components';
import { color } from 'framer-motion';
  
  interface SkillSyncHelloEmailProps {
    username?: string;
    updatedDate?: Date;
  }
  
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : '';
  
  export const SkillSyncHelloEmail = ({
    username,
    updatedDate,
  }: SkillSyncHelloEmailProps) => {
    const formattedDate = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(updatedDate);
  
    return (
      <Html>
        <Head />
        <Body style={main}>
          <Preview>You have signed up for SkillSync</Preview>
          <Container style={container}>
            <Section style={logo}>
              <Img
                width={280}
                src="https://res.cloudinary.com/dixm4mirt/image/upload/v1744252839/logo_fehkzk.svg"
                alt="SkillSync"
                style={logoImg}
              />
            </Section>
            <Section style={sectionsBorders}>
              <Row>
                <Column style={sectionBorder} />
                <Column style={sectionCenter} />
                <Column style={sectionBorder} />
              </Row>
            </Section>
            <Section style={content}>
              <Text style={paragraph}>Hi {username},</Text>
              <Text style={paragraph}>
                Welcome to the SkillSync!!!
              </Text>
              <Text style={paragraph}>
                We are excited to have you on board. You can now start using the
                SkillSync to mange your skills and projects.
              </Text>
              <Text style={paragraph}>
                Thanks,
                <br />
                SkillSync Team
              </Text>
            </Section>
          </Container>
  
          <Section style={footer}>
            <Row>
              <Column align="right" style={{ width: '50%', paddingRight: '8px' }}>
                <a href="https://www.linkedin.com/in/mohamed-adnan-abdelrhman-ali/">
                  <Img
                    width={20}
                    src="https://res.cloudinary.com/dixm4mirt/image/upload/v1744253758/linkedin_dglq6n.png"
                    alt="LinkedIn"
                  />
                </a>
              </Column>
              <Column align="left" style={{ width: '50%', paddingLeft: '8px' }}>
                <Img
                  width={20}
                  src="https://res.cloudinary.com/dixm4mirt/image/upload/v1744253223/facebook_sgbgdg.png"
                  alt="Facebook"
                />
              </Column>
            </Row>
            <Row>
              <Text style={{ textAlign: 'center', color: '#706a7b' }}>
                <span style={{color:"rgb(65,105,225)"}}>©</span> 2025 SkillSync, All Rights Reserved <br />
                Cairo,Egypt
              </Text>
            </Row>
          </Section>
        </Body>
      </Html>
    );
  };
  
  SkillSyncHelloEmail.PreviewProps = {
    username: 'alanturing',
    updatedDate: new Date('June 23, 2022 4:06:00 pm UTC'),
  } as SkillSyncHelloEmailProps;
  
  export default SkillSyncHelloEmail;
  
  const fontFamily = 'HelveticaNeue,Helvetica,Arial,sans-serif';
  
  const main = {
    backgroundColor: '#efeef1',
    fontFamily,
  };
  
  const paragraph = {
    lineHeight: 1.5,
    fontSize: 14,
  };
  
  const container = {
    maxWidth: '580px',
    margin: '30px auto',
    backgroundColor: '#ffffff',
  };
  
  const footer = {
    maxWidth: '580px',
    margin: '0 auto',
  };
  
  const content = {
    padding: '5px 20px 10px 20px',
  };
  
  const logo = {
    padding: 30,
  };
  
  const logoImg = {
    margin: '0 auto',
  };
  
  const sectionsBorders = {
    width: '100%',
  };
  
  const sectionBorder = {
    borderBottom: '1px solid rgb(238,238,238)',
    width: '249px',
  };
  
  const sectionCenter = {
    borderBottom: '1px solid rgb(65,105,225)',
    width: '150px',
  };
  
  const link = {
    textDecoration: 'underline',
  };
  