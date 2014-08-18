"use strict";

var dt=1;
var steps=50;
var size=100;

var waves=[];

var force=0.01;
var distance=5;
var gravity=0.7/30;
var atmosphere=1;
var tension=20;
var viscosity=8;
var drag=0.3;
var density=30;

var energy;

var boat=(
	function(w,h)
	{
		return {
			x:0,
			y:0,
			xv:0,
			yv:0,
			xf:0,
			yf:0,
			theta:0,
			omega:0,
			alpha:0,
			width:w,
			height:h,
			f:sqrt(w*w-h*h)/2,
			mass:500,
			moi:500,
			splash:[[0.8,0],[0,0.3]],
			collide:function(no,n)
			{
				var r,f,v,k,d;
				r=[
					no.x-boat.x,
					no.y-boat.y+no.bottom
				];
				d=unit(boat.theta);
				k=-boat.width;
				k+=magn(addi(r,scal(-boat.f,d)));
				k+=magn(addi(r,scal(+boat.f,d)));
				if(k<0)
				{
					k*=100;
					f=[
						0,
						-no.width*2
					];
					if(waves[n+1]!==undefined)
					{
						f[0]+=waves[n].y-waves[n+1].y;
					}
					if(waves[n-1]!==undefined)
					{
						f[0]+=waves[n-1].y-waves[n].y;
					}
					d=magn(f);
					f=scal(1/d,f);
					d=magn(r);
					r=scal(1/d,r);
					v=[
						boat.xv-d*r[1]*boat.omega,
						boat.yv+d*r[0]*boat.omega
					];
					v=comb(v,boat.splash[0],boat.splash[1]);
					f=addi(f,v);
					no.f+=k;
					boat.xf+=f[0]*k;
					boat.yf+=f[1]*k;
					boat.alpha+=xpro(f,r);
				}
			}
		};
	}
)(12,10);

var Wave=(
	function()
	{
		var x;
		x=-100;
		return function()
		{
			x+=200/size;
			return {
				y:30,
				v:0,
				f:0,
				height:30,
				bottom:-40,
				width:200/size,
				thick:0.8,
				x:x-100/size
			};
		};
	}
)();

var initMain=function()
{
	var n,no,weight,surface,area;
	area=0;
	weight=0;
	surface=0;
	n=size;
	while(n--)
	{
		waves[n]=Wave();
		no=waves[n];
		area+=no.height*no.width;
		weight+=gravity*density*no.height*no.width;
		surface+=no.width;
	}
	energy=weight/surface+atmosphere;
	energy*=area;
	dt/=steps;
	point();
};

var initDraw=function()
{
	ctx.lineWidth=200/wW;
};

var pressure=function()
{
	var area,n,no;
	area=0;
	n=size;
	while(n--)
	{
		no=waves[n];
		if(no.y>0)
		{
			area+=(no.y)*no.width;
		}
	}
	return energy/area;
};

var physics=function()
{
	var P,n,no,mo,f;
	P=pressure();
	n=size-1;
	while(n--)
	{
		no=waves[n];
		mo=waves[n+1];
		f=tension*(no.y-mo.y);
		no.f-=f;
		mo.f+=f;
		f=viscosity*(no.v-mo.v);
		no.f-=f;
		mo.f+=f;
		no.f+=no.width*(P-atmosphere);
		no.f-=gravity*density*no.width*no.y;
		no.f-=drag*no.v;
		f=userX-no.x;
		f=userC*force/(distance+f*f)*4000;
		no.f+=f*no.width;
		boat.collide(no,n);
	}
	n=waves.length;
	while(n--)
	{
		no=waves[n];
		no.f/=density*no.width;
		no.v+=no.f*dt;
		no.y+=no.v*dt;
		no.f=0;
	}
	boat.xf/=boat.mass;
	boat.yf/=boat.mass;
	if(boat.x>95)
	{
		boat.xf-=1;
	}
	if(boat.x<-95)
	{
		boat.xf+=1;
	}
	boat.alpha/=boat.moi;
	boat.xv+=boat.xf*dt;
	boat.yv+=boat.yf*dt;
	boat.omega+=boat.alpha*dt;
	boat.x+=boat.xv*dt;
	boat.y+=boat.yv*dt;
	boat.theta+=boat.omega*dt;
	boat.xf=0;
	boat.yf=-gravity*boat.mass*3;
	boat.alpha=0;
};

var chronometric=function()
{
	var k,P,n,no,mo,f;
	k=steps;
	while(k--)
	{
		physics();
	}
	draw();
};

var draw=function()
{
	var n,no,h;
	ctx.clearRect(-100,-50,200,100);

	ctx.fillStyle=rgba(0.9,0.9,0.9,1);
	ctx.save();
	ctx.translate(boat.x,boat.y);
	ctx.rotate(boat.theta);
	ctx.scale(boat.width/2,boat.height/2);
	mark(0,0,1,rgba(0.9,0.9,0.9,1));
	ctx.scale(2/boat.width,2/boat.height);
	mark(+boat.f,0,0.2,rgba(0,0,0,1));
	mark(-boat.f,0,0.2,rgba(0,0,0,1));
	mark(0,+boat.f*boat.height/boat.width,0.1,rgba(0,0,0,1));
	mark(0,-boat.f*boat.height/boat.width,0.1,rgba(0,0,0,1));
	ctx.restore();

	n=waves.length;
	while(n--)
	{
		no=waves[n];
		if(no.v<0)
		{
			ctx.fillStyle=rgba(0.5,0.05,0.48*2,Math.abs(no.v)*6);
		}
		else
		{
			ctx.fillStyle=rgba(0.05,0.5,0.48*2,Math.abs(no.v)*6);
		}
		h=0.15+2.5*2.4/(1+expo(4-2*no.v*no.v));
		ctx.fillRect(no.x-no.width/2*no.thick,no.y+no.bottom-h/2,no.width*no.thick,h);
		ctx.fillStyle=rgba(0.17,0,0.5,1);
		ctx.fillRect(no.x-no.width/2*no.thick,no.y+no.bottom,no.width*no.thick,-no.y);
	}
};