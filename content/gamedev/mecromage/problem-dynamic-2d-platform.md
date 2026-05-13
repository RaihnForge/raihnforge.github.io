---
title: "Problem: Dynamic 2d platform.."
date: 2012-08-17
description: ".. what am I really illustrating?"
tags: ["Design", "Game Design", "Indie Game Blog", "Indie Game Design", "Muse"]
aliases:
  - "/gamedev/problem-dynamic-2d-platform/"
  - "/gamedev/indie-dev-dues/problem-dynamic-2d-platform/"
archived: false
draft: false
recovered: true
---
## .. what am I really illustrating?

[![image004](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image004_thumb_3.jpg "image004")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image004_3.jpg)So, what am I looking at? When your rendering anything artistically you want references, and lots of them. You are primarily creating a 2d illusion from a 3d concept, most of the time something from the world we live in. For the old school platformer I've found that from where the character's feet meet the ground and toward the viewer 'thar be dragons', as a mindful adventure once said.

The horizon line is not so fluid a thing when using 2d assets. The assets wont change how they look when they are moved about in the picture plane. When the character is moving within the plane, shifting objects hither and dither at a whim we start having problems with our rendered objects. If you can't guarantee the horizon line, you can pretty much say goodbye to conveying any sort of real objects in space.

Or can we? The old school games solve most of this conundrum by assuming a horizon line is where the character is at any given time, the horizon line on the playing field is always where the player's avatar is; thus a platform's top surface is always where we assume the horizon line for the given object to render.

[![image002](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image002_thumb.jpg "image002")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image002.jpg)

For anything that falls in the background we assume a middle horizon line, anticipating that players would desire a centered view of the Screen. This short quip does little to justice the topic of convincing backgrounds in a 2d platforming game. We will be addressed this topic in a later article.

[![image004](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image004_thumb.jpg "image004")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image004.jpg)

Back to the platforming 'layer'.

A simulated 3d of this picture would look more like the following. All vanishing points going toward the middle in this instance. Yet if we render these platform assets from then view alone, we will be creating obvious contradictions as the camera shifts about.

[![image006](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image006_thumb.jpg "image006")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image006.jpg)

The secret to making it work is ambiguity. Let the mind connect the dots that don’t actually make sense. Old games more easily accomplished this since the resolution was so low that we were imagining already, effectively we were rendering in our mind what the game world was missing. Mine craft is an excellent example of a successful game that is based on the player participating in the 'rendering' of the world. This is one of the reasons it is so engaging to those that invest in it. It could well be called Mind-craft.

[![image008](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image008_thumb.jpg "image008")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image008.jpg)

In Mario 1 every block is far enough away from the viewer as to not be heavily effected by perspective. To demonstrate, hold a cellphone flat (like a sandwich) at arms length and move it up and down. You will be able to move it up and down a decent amount of distance before noticing the top and bottom planes. Now bring your cell phone very close to your face and do the same. Very quickly you will notice the top and bottom surfaces becoming a greater portion of what fills your personal picture plane with much less movement.

[![image010](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image010_thumb.jpg "image010")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image010.jpg)

Another approach is presuming a vantage point of looking slightly down on the field of play. Thor for the NDS utilizes this fixed isometric perspective. This works well in part because the way we digest information is similar.

Ask a child to draw a road going off into the distance and they will have trouble getting the road to meet the horizon line, they will want to draw it off the page. Even though we see a road on the horizon as only a slight thickness, the mind's eye identifies the road from a birds eye vantage.

When we process objects its not so different form how a 3d program would texture a box. We want to know the top, sides, and bottom then wrap that information up under a label and file away. This is one of the reasons why foreshortening technique is one of the most difficult to master for any artist. We always want maximum information.

Isometric illustration is usually a fixed 3/4 view of an object often used in How to instructions that give our brains the information we crave, even if it bends the rules of perspective just a little to get that information. The vanishing points of the below illustration will never converge at a point, but continue forever.

[![image011](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image011_thumb.jpg "image011")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image011.jpg)

In the high definition space tricks become more apparent, even obvious, since we are seeing more detail we expect more accuracy. Braid deflects much of the scrutiny by using an ambiguous art style.

Much like cartooning, where we are looking at simplified concepts of people and forms, the 'painterly' wash style of braid allows the mind to make up its own mind of what's going on, as well as not scrutinize it in such a way that it is truly an accurate representation of the world we exist in, but rather hinting at an idea of something.

We also know that Braid is a puzzle to be solved, with a focus on pieces that we want to easily identify, not precise replications of environments as would be expected in an adventure/exploration game.

We've discussed the problem of an HD adventure platformer conveying a believable environment based off assets not having a fixed horizon line. Let us take a look at what might be the solutions.

**Solution - Sophisticated Ambiguity**

**Roll-Out Illusion**

[![image013](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image013_thumb.jpg "image013")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image013.jpg)

[![image015](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image015_thumb.jpg "image015")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image015.jpg)

Braid evokes what I call the **Roll-Out Illusion.** The landscape rolls out toward the viewer. This deflects any need for an accurate asset associated horizon line because if the platform is above the horizon line. In this example from the lower horizon line your mind is telling you that you are looking up at a small hillock. If that same platform is placed below in the zone of the horizon line, your brain rationalizes that you are looking slightly down upon a surface. You assume that his is now perhaps the top of some terrain as you look upon it from a hill.

As effectively employed by the Braid screen shot, an ambiguous hill or landscape that we can perceive from multiple angles and make assumptions that would in actuality effectively morph the actual landscape we are attempting to convey. Roll-Out Illusion extends the top surface of the object dramatically toward the picture plane when comparing it to Roll-Over Illusion.

**Roll-Over Illusion**

[![image017](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image017_thumb.jpg "image017")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image017.jpg)

I will coin a term for purpose of discussion, **2d Cut Away:** An irrational slicing of a any given structure or mass so that we the viewer can view the goods, the action inside.

Here the red 'Carpet' Rolls over the lip of some edge of the floor. If the character turned and walked toward the viewer they would fall right off the sheer cliff of Dracula's room.

In the above Braid example there seems at first to be no 2d Cut Away. Instead the Roll-Out Illusion makes you think that the hill simply is rolling out to you, thus the character would walk toward you and slowly walk down the hill and presumably meet you. looking up at any object like a hill you sacrifice your view of the ground you walk on. You might become frustrated if the Braid hero walked down that hill and you can not follow the character down to where the hill meets ground level.

[![image019](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image019_thumb.jpg "image019")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image019.jpg)

Here again, Alucard would simply fall off this platform that has been constructed for us to view him. Though, obviously we know that he is inside some great room and these columns describe something about the surrounding walls, perhaps the wall the would be obscuring our view if it was properly placed in front of us.

[![image021](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image021_thumb.jpg "image021")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image021.jpg)

Most often the Roll-Over Illusion is accompanied by a crown molding. The crown hints that Alucard is not walking some tight rope, it gives us the indication that the ground has some width as directly compared to what is under him convincing us that there is some depth somewhere in there.

The prevailing 2d Cut Away materials presented in the none playable area are that which we might expect if Alucard looked toward the viewer, perhaps. We the viewer would normally want to know what is to the sides of us and would not care what is under us so much (in the real world would be the ground, or foundation of the house), so the theory seems to be replace what we would normally know, where we don’t normally care to know.

If Alucard was to look toward the viewer he might see the browned brick wall. If we give the mind all the missing information it wants, even if it is not in the correct space, than it might well be satisfied. In practice If we removed the lid to a jar and showed a person both parts they would put them together instantly in their mind, creating the object as a whole.

The background wall almost over emphasizes the small details we might expect on the wall we can't see. The missing wall information may be filled in by over cramming the background wall with what which may be assumed is on the stolen wall. In rendering we might fill the usually unseen above and below space with the material that we might expect on the 2d Cut Away wall, additionally over filling the background wall with clutter and other props.

[![image023](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image023_thumb.jpg "image023")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image023.jpg)

Once again the crown molding Roll-Over Illusion. Though it could be asserted that the 2d Cut Away materials being revealed are not so much what alucard would be looking at had he decided to walk toward the viewer, but the materials that would exist if the room had actually been cut away, or even what might be on the outside of the wall in the background.

The cut away texture should be simple, unremarkable in comparison to the background and zero plane props. The material repeats often and offers very little in variety. The viewer remains more interested in the background, once they have identified the substance of which the room or space is made of. In this case stone bricks.

[![image025](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image025_thumb.jpg "image025")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image025.jpg)

In this example we see that there is an evident brighter line over the top of the surface. Depending on the players current position this line hints at either the top of the surface (if we were looking down on it), or the direct side of the surface (almost as if it were a crown molding, or a slight roll-over of the surface, as a cube might if all the edges were smoothed over).

Ambiguity wins the day, your mind decides at any given perspective which of the two (Surface or Side) based on where you are looking.

**Fade out Illusion**

[![image027](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image027_thumb.jpg "image027")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image027.jpg)

Also could be called the 'nothing-to-see-here-so-move-along' trick. The bottom of the picture plane is all shadow that gradually reveals the terrain you are moving along.

'Whats below? What is this thing that is standing on, where are we as the viewer? Wait, what? This isn't real at all, this is a pop-up book! LAME!', what one might say to themself.

Shadow allows us to at any time to tell the viewer 'don’t look too close over here, just go with it, make it up yourself.'

Jaws director Steven Speilberg accredited a lot of the film's success with the fact that the mechanical shark never became filmable due to all the breakdowns. When the deadline didn't allow for any more attempts at fixing the thing for shooting, he simply had to work around it. Its in the shadows and unseen places where the imagine is left to its own devices, and in the mind of the beholder will always be the greatest purveyor of illusion.

**Slight of Parallax Dupe (Josh Original)**

[![image029](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image029_thumb.jpg "image029")](http://www.joshuakeyes.us/wordpress/raihn/images/0817e92c596d_147E9/image029.jpg)

This is what we plan to employ in our game to over come the fact that being HD means that there is less flexibility in utilizing ambiguity. By placing a layer just over our 0 plane (Zero plane is where the player stands) with slight vertical parallax we can allow more or less of the top surface to show to a limited extent. Hinting at some slight movement in the picture plane height of a platform should 'sale' that the player is running around on a piece of geometry rather than a plane that has exactly no depth.

We hope...
