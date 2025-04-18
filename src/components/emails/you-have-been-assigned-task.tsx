import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  

  interface AssignedTaskProps {
    assignename?: string;
    workspacename?: string;
    projectname?: string;
    dueDate?: Date;
    taskname?: string;
    workSpaceId?: string;
    taskId?: string;
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : '';
  
  export const AssignedTask = ({
    assignename,
    workspacename,
    projectname,
    dueDate,
    taskname,
    workSpaceId,
    taskId,
    }:AssignedTaskProps) => {
    const formattedDate = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(dueDate);

    return (
    <Html>
        <Head />
        <Body style={main}>
          <Preview>You have been assigned a task</Preview>
          <Container style={container}>
            <Section style={box}>
              <Img
                src="https://res.cloudinary.com/dixm4mirt/image/upload/v1744252839/logo_fehkzk.svg"
                width="210"
                height="70"
                alt="Stripe"
              />
              <Hr style={hr} />
              <Text style={paragraph}>
              Hi {assignename} You have been assigned a task in workspace:{workspacename} in project:{projectname} with due date:{formattedDate} and task name:{taskname}.
              </Text>
              <Button style={button} href={`http://localhost:3000/workspaces/${workSpaceId}/tasks/${taskId}`}>
                View The Task
              </Button>
              <Hr style={hr} />
              <Text style={paragraph}>
                 if you have any questions, please reach out to the TeamLeader or read the project 
                <Link
                  style={anchor}
                  href="https://docs.stripe.com/dashboard/basics"
                >
                  docs
                </Link>{' '}
                wich is very handy.
              </Text>
              <Text style={paragraph}>— The {projectname} team</Text>
              <Hr style={hr} />
              <Text style={{ textAlign: 'center', color: '#706a7b' }}>
                <span style={{color:"rgb(65,105,225)"}}>©</span> 2025 SkillSync, All Rights Reserved <br />
                Cairo,Egypt
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    )
    
  };
  
  AssignedTask.PreviewProps = {
    assignename: 'alanturing',
    workspacename: 'string',
    projectname: 'string',
    dueDate: new Date('June 23, 2022 4:06:00 pm UTC'),
    taskname: 'string',
    workSpaceId: 'string',
    taskId: 'string',
  } as AssignedTaskProps;

  export default AssignedTask;
  
  const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
  };
  
  const box = {
    padding: '0 48px',
  };
  
  const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
  };
  
  const paragraph = {
    color: '#525f7f',
  
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
  };
  
  const anchor = {
    color: '#556cd6',
  };
  
  const button = {
    backgroundColor: '#656ee8',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '10px',
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
  };
  